export type PackageManager = 'bun' | 'npm' | 'yarn' | 'pnpm';

export const packageManagers: PackageManager[] = ['bun', 'npm', 'yarn', 'pnpm'];

const storageKey = 'docs-package-manager';

/** The reader's package manager, shared by every terminal on the page and remembered across visits. */
export const packageManagerPreference = $state<{ current: PackageManager }>({ current: 'bun' });

export function loadPackageManagerPreference() {
	const saved = localStorage.getItem(storageKey);
	if (saved === 'bun' || saved === 'npm' || saved === 'yarn' || saved === 'pnpm') {
		packageManagerPreference.current = saved;
	}
}

export function choosePackageManager(manager: PackageManager) {
	packageManagerPreference.current = manager;
	localStorage.setItem(storageKey, manager);
}

const devFlags: Record<PackageManager, string> = {
	bun: '-d',
	npm: '--save-dev',
	yarn: '--dev',
	pnpm: '-D'
};

export function installCommand(manager: PackageManager, packageName: string, dev = false): string {
	let verb = 'add';
	if (manager === 'npm') verb = 'install';
	if (!dev) return `${manager} ${verb} ${packageName}`;
	return `${manager} ${verb} ${devFlags[manager]} ${packageName}`;
}
