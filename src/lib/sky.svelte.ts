export type Theme = 'light' | 'dark';
type Sky = 'day' | 'night';

/** How long the outgoing sun or moon takes to leave, matching SkyProps' transitions. */
const exitDurationMs: Record<Theme, number> = { dark: 1200, light: 900 };

/** The theme the visitor chose, shared by the header toggle and the draggable sun and moon. */
export const themeState: { current: Theme } = $state({ current: 'dark' });

let pendingThemeSwitch: ReturnType<typeof setTimeout> | undefined;

export function skyForTheme(theme: Theme): Sky {
	if (theme === 'light') return 'day';
	return 'night';
}

export function readThemeFromDocument() {
	themeState.current = 'dark';
	if (document.documentElement.dataset.theme === 'light') themeState.current = 'light';
}

export function isNight(): boolean {
	return document.documentElement.dataset.sky === 'night';
}

/** Moves the sun and moon first and switches the colours once the outgoing one has left. */
export function switchTheme(theme: Theme) {
	const root = document.documentElement;
	themeState.current = theme;
	localStorage.setItem('theme', theme);
	clearTimeout(pendingThemeSwitch);
	root.dataset.sky = skyForTheme(theme);

	if (!hasSkyStage()) {
		root.dataset.theme = theme;
		return;
	}
	pendingThemeSwitch = setTimeout(() => {
		root.dataset.theme = theme;
	}, exitDurationMs[theme]);
}

export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasSkyStage(): boolean {
	if (prefersReducedMotion()) return false;
	return document.querySelector('[data-sky-stage]') !== null;
}
