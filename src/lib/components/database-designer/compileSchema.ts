// Compiles OpenSchema DSL into the read-only diagram the designer shows on the
// right. Runs entirely in the browser via the `openschema` package (the same
// compiler the schema-compiler sidecar wraps), so the preview matches what the
// server will emit on create.
//
// The diagram shows the FINAL table structure — including the ownership/audit
// fields the server injects (subject_user_id, organization_id, timestamps, the
// versioning + grant companion tables). Those injected fields are flagged so the
// UI can dim them and explain why they appear even though the author never wrote
// them. The injection rules mirror `rewriteSchemaInput` in the Go API
// (apps/api/gql/resolvers/client_schema_rewrite.go); keep the two in sync until
// the compiler emits SurrealQL (and these fields) directly.
import { parse, resolve, getEmitter } from 'openschema';
import type { ResolvedSchema, ResolvedModel, ResolvedField, Diagnostic } from 'openschema';
import type { InternalTable } from 'openschema';
import type { TableDef, FieldDef, CanvasRelation } from '@neoworks-dev/ui';

export interface CompiledSchema {
	tables: TableDef[];
	relations: CanvasRelation[];
	diagnostics: Diagnostic[];
	// Distinct server-managed field names present across the compiled tables, in
	// first-seen order. Drives the "why are these fields here?" explanation.
	injectedFields: string[];
}

const EMPTY: CompiledSchema = { tables: [], relations: [], diagnostics: [], injectedFields: [] };

export function compileClientSchema(source: string): CompiledSchema {
	if (source.trim().length === 0) return EMPTY;

	let resolved: ResolvedSchema;
	try {
		resolved = resolve(parse(source));
	} catch {
		return EMPTY;
	}

	if (resolved.hasErrors) {
		return { ...EMPTY, diagnostics: resolved.diagnostics };
	}

	const emitter = getEmitter('internal');
	if (emitter === null) return { ...EMPTY, diagnostics: resolved.diagnostics };

	let internalTables: InternalTable[];
	try {
		const output = emitter.emit({ schema: resolved, company: null, includePrivate: false, options: {} });
		internalTables = (JSON.parse(output[0].contents) as { tables: InternalTable[] }).tables;
	} catch {
		return { ...EMPTY, diagnostics: resolved.diagnostics };
	}

	const tables: TableDef[] = [];
	const injectedSeen = new Set<string>();
	const injectedFields: string[] = [];
	const noteInjected = (name: string) => {
		if (injectedSeen.has(name)) return;
		injectedSeen.add(name);
		injectedFields.push(name);
	};

	for (const table of internalTables) {
		tables.push(...finalizeTable(table, noteInjected));
	}

	return {
		tables,
		relations: deriveRelations(resolved),
		diagnostics: resolved.diagnostics,
		injectedFields,
	};
}

// Expands one compiled table into its final diagram form: the author's fields
// plus the server-injected ownership/audit fields, followed by any companion
// tables (versioning history, share grants) the server provisions alongside it.
function finalizeTable(table: InternalTable, noteInjected: (name: string) => void): TableDef[] {
	const kind = table.kind || 'data';
	const visibility = table.visibility || 'private';
	const versioned = table.history === true;
	// Internal (org-owned) tables carry no per-user owner — the instance is the org.
	const injectTimestamps = kind === 'internal' || visibility !== 'private';

	const authored: FieldDef[] = table.fields.map((f) => ({ name: f.name, type: f.type }));
	const leading: FieldDef[] = [];
	const trailing: FieldDef[] = [];

	if (kind === 'data') {
		leading.push(injected('subject_user_id', 'string', noteInjected));
	}
	if (injectTimestamps || versioned) {
		trailing.push(injected('created_at', 'datetime', noteInjected));
		trailing.push(injected('updated_at', 'datetime', noteInjected));
	}
	if (versioned) {
		trailing.push(injected('version', `option<record<${table.name}_version>>`, noteInjected));
	}

	const result: TableDef[] = [
		{
			name: table.name,
			schemafull: table.schemafull,
			fields: [...leading, ...authored, ...trailing],
			indexes: table.indexes.map((i) => ({
				name: i.name,
				fields: i.fields,
				unique: i.unique === true,
				fulltext: i.fulltext === true,
			})),
			subjectPath: table.subjectPath,
		},
	];

	if (versioned) {
		result.push(versionHistoryTable(table, authored, kind, noteInjected));
	}
	if (visibility === 'shared') {
		result.push(grantTable(table.name, noteInjected));
	}
	return result;
}

// The append-only <name>_version table mirrors the current row's data fields plus
// its ownership, back-referencing the parent. Entirely server-provisioned.
function versionHistoryTable(
	table: InternalTable,
	authored: FieldDef[],
	kind: string,
	noteInjected: (name: string) => void
): TableDef {
	const fields: FieldDef[] = [injected(`${table.name}_id`, `record<${table.name}>`, noteInjected)];
	if (kind === 'data') fields.push(injected('subject_user_id', 'string', noteInjected));
	for (const field of authored) fields.push({ ...field, injected: true });
	fields.push(injected('created_at', 'datetime', noteInjected));
	return {
		name: `${table.name}_version`,
		schemafull: table.schemafull,
		fields,
		indexes: [{ name: `idx_${table.name}_version_parent`, fields: [`${table.name}_id`], unique: false }],
	};
}

// The <name>_grant companion backing a "shared" table: (row, grantee) pairs that
// widen read access. Server-provisioned.
function grantTable(table: string, noteInjected: (name: string) => void): TableDef {
	return {
		name: `${table}_grant`,
		schemafull: true,
		fields: [
			injected('row', `record<${table}>`, noteInjected),
			injected('grantee_user_id', 'string', noteInjected),
			injected('created_at', 'datetime', noteInjected),
		],
		indexes: [{ name: `idx_${table}_grant_unique`, fields: ['row', 'grantee_user_id'], unique: true }],
	};
}

function injected(name: string, type: string, noteInjected: (name: string) => void): FieldDef {
	noteInjected(name);
	return { name, type, injected: true };
}

// ── Relation derivation (ported from apps/openschema schemaCompile) ────────────
// A field whose type references another model becomes an edge. Relations use table
// names as ids, matching layoutTables (which keys tables by name).

function deriveRelations(schema: ResolvedSchema): CanvasRelation[] {
	const tableByModel = new Map<string, string>();
	for (const model of schema.records.values()) {
		if (model.isGeneric) continue;
		tableByModel.set(model.symbol.localName, tableNameForModel(model));
	}

	const enumNames = new Set<string>();
	for (const enumSymbol of schema.enums.values()) enumNames.add(enumSymbol.localName);

	const relations: CanvasRelation[] = [];
	for (const model of schema.records.values()) {
		if (model.isGeneric) continue;
		const fromTable = tableNameForModel(model);

		for (const field of model.fields) {
			if (field.isPrivate) continue;
			if (hasDecorator(field, 'primaryKey')) continue;

			const targetModel = namedTargetOf(field.type);
			if (targetModel === null || enumNames.has(targetModel)) continue;

			const toTable = tableByModel.get(targetModel);
			if (toTable === undefined || toTable === fromTable) continue;

			const label = columnNameForField(field);
			relations.push({ id: `${fromTable}.${label}->${toTable}`, fromTableId: fromTable, toTableId: toTable, label });
		}
	}
	return relations;
}

function tableNameForModel(model: ResolvedModel): string {
	const explicit = firstStringArg(model.decorators, 'table');
	if (explicit !== null) return explicit;
	return toSnakeCase(model.symbol.localName);
}

function columnNameForField(field: ResolvedField): string {
	const explicit = firstStringArg(field.decorators, 'sql.column');
	if (explicit !== null) return explicit;
	return toSnakeCase(field.name);
}

// Unwraps nullable/array wrappers to find a referenced model name, if any.
function namedTargetOf(type: unknown): string | null {
	const node = type as { kind?: string; inner?: unknown; element?: unknown; path?: string[] };
	if (node === null || node === undefined || typeof node.kind !== 'string') return null;
	if (node.kind === 'nullable') return namedTargetOf(node.inner);
	if (node.kind === 'array') return namedTargetOf(node.element);
	if (node.kind === 'named' && Array.isArray(node.path) && node.path.length > 0) {
		return node.path[node.path.length - 1];
	}
	return null;
}

interface DecoratorLike {
	name: string;
	args: { value: { kind: string; value?: unknown } }[];
}

function hasDecorator(field: ResolvedField, name: string): boolean {
	return (field.decorators as DecoratorLike[]).some((decorator) => decorator.name === name);
}

function firstStringArg(decorators: unknown, name: string): string | null {
	const list = decorators as DecoratorLike[];
	const decorator = list.find((d) => d.name === name);
	if (decorator === undefined || decorator.args.length === 0) return null;
	const value = decorator.args[0].value;
	if (value.kind === 'string' && typeof value.value === 'string') return value.value;
	return null;
}

function toSnakeCase(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.toLowerCase();
}
