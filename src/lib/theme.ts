/** Pages in the scrapbook style. They are always light, whatever theme the visitor picked. */
const alwaysLightPaths = ['/', '/pricing'];

export function isAlwaysLight(pathname: string): boolean {
	return alwaysLightPaths.includes(pathname);
}
