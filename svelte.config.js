import adapter from '@sveltejs/adapter-auto';
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
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
