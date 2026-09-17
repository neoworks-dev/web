import adapter from '@sveltejs/adapter-node';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [mdsvex(mdsvexConfig)],
	compilerOptions: {
		// Force runes mode for the project, except for libraries and mdsvex-generated
		// markdown wrappers (which still emit legacy `$$props`). Can be removed in svelte 6.
		runes: ({ filename }) => {
			const segments = filename.split(/[/\\]/);
			if (segments.includes('node_modules')) return undefined;
			if (filename.endsWith('.svx') || filename.endsWith('.md')) return undefined;
			return true;
		}
	},
	kit: {
		// A node server, not a static bundle: `/auth/callback`, `/auth/logout` and
		// `/auth/refresh` are server endpoints, and the layout loads run server-side
		// to read the session cookie. `ssr = false` in the root layout only turns off
		// HTML rendering — it does not make the app static.
		adapter: adapter()
	}
};

export default config;
