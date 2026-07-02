import { getContext, setContext } from 'svelte';

const KEY = Symbol('view-ctx');

export interface SidebarPanel {
	component: any;
	props: () => Record<string, unknown>;
	onback?: () => void;
	label?: string;
}

export interface ViewContext {
	get sidebarPanel(): SidebarPanel | null;
	setSidebarPanel(p: SidebarPanel | null): void;
}

export function createViewContext(): ViewContext {
	let panel = $state<SidebarPanel | null>(null);
	const ctx: ViewContext = {
		get sidebarPanel() { return panel; },
		setSidebarPanel(p) { panel = p; },
	};
	setContext(KEY, ctx);
	return ctx;
}

export function useViewContext(): ViewContext {
	return getContext<ViewContext>(KEY);
}
