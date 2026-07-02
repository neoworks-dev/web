// The database-designer types + geometry helpers now live in the shared UI
// package so they can back the read-only SchemaDiagram too. Re-exported here so
// existing `./types` imports keep working.
export type {
	FieldDef,
	IndexDef,
	TableDef,
	CanvasTable,
	CanvasRelation,
	CanvasGroup,
	SelectionState,
} from '@neoworks-dev/ui';

export {
	TABLE_W,
	TABLE_HEADER_H,
	TABLE_ROW_H,
	GRID,
	snap,
	tableConnectRight,
	tableConnectLeft,
	tableBottom,
	GROUP_COLORS,
} from '@neoworks-dev/ui';
