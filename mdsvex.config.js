import { fileURLToPath } from 'node:url';
import rehypeSlug from 'rehype-slug';

// mdsvex reads the layout file from disk at preprocess time, so it needs a real
// filesystem path (not a `$lib` alias). Absolute so it resolves from any .svx directory.
const docArticle = fileURLToPath(
	new URL('./src/lib/components/docs/DocArticle.svelte', import.meta.url)
);

/** @type {import('mdsvex').MdsvexOptions} */
const config = {
	extensions: ['.svx', '.md'],
	// Wraps every doc page's markdown in the prose-styled article shell.
	layout: {
		_: docArticle
	},
	rehypePlugins: [rehypeSlug]
};

export default config;
