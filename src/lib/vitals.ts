const repository = 'neoworks-dev/vitals';

/** Source links for the vitals code-intelligence engine. */
export const vitals = {
	sourceUrl: `https://github.com/${repository}`,
	readmeUrl: `https://github.com/${repository}#readme`,
	benchmarkUrl: `https://github.com/${repository}/blob/main/bench/tasks.json`,
	designNotesUrl: `https://github.com/${repository}/blob/main/DESIGN.md`
};

/** The MCP server block, copied verbatim into an agent's config. */
export const mcpServerConfig = `{
  "mcpServers": {
    "vitals": {
      "command": "bun",
      "args": ["run", "/path/to/vitals/src/mcp.ts"],
      "env": { "VITALS_ROOT": "/path/to/your/project" }
    }
  }
}`;

export type VitalsSection = {
	hash: string;
	label: string;
};

export const vitalsSections: VitalsSection[] = [
	{ hash: '#tools', label: 'The five tools' },
	{ hash: '#benchmark', label: 'Benchmark' },
	{ hash: '#output', label: 'Reading the output' },
	{ hash: '#languages', label: 'Languages' },
	{ hash: '#install', label: 'Install' }
];

/**
 * A link to the vitals landing page. The site is reachable two ways — as
 * `vitals.<base-domain>` and as `<base-domain>/dev/vitals` — so the prefix
 * depends on which host the visitor is on.
 */
export function vitalsHref(hostname: string): string {
	if (hostname.startsWith('vitals.')) return '/';
	return '/dev/vitals';
}
