import { describe, expect, test } from 'bun:test';
import { highlightCode } from '../src/lib/docs/highlight';

describe('docs highlighter', () => {
	test('marks JSON keys apart from string values', () => {
		const html = highlightCode('{ "id": "abc", "size": 42 }', 'json');
		expect(html).toContain('<span class="token property">"id"</span>');
		expect(html).toContain('<span class="token string">"abc"</span>');
		expect(html).toContain('<span class="token number">42</span>');
	});

	test('marks shell commands, flags and variables', () => {
		const html = highlightCode('curl -X POST "$URL" # go', 'bash');
		expect(html).toContain('<span class="token function">curl</span>');
		expect(html).toContain('<span class="token flag">-X</span>');
		expect(html).toContain('<span class="token comment"># go</span>');
	});

	test('escapes markup in code of any language', () => {
		expect(highlightCode('<b>&</b>', 'text')).toBe('&lt;b&gt;&amp;&lt;/b&gt;');
		expect(highlightCode('const a = "<x>"', 'ts')).toContain('&lt;x&gt;');
	});

	test('keeps the text intact when stripped of tags', () => {
		const code = 'const user = await neoworks.signin() // go';
		expect(highlightCode(code, 'ts').replace(/<[^>]+>/g, '')).toBe(code);
	});
});

describe('docs highlighter languages', () => {
	test('marks Kotlin keywords and calls', () => {
		const html = highlightCode('suspend fun load() = client.get("x")', 'kotlin');
		expect(html).toContain('<span class="token keyword">suspend</span>');
		expect(html).toContain('<span class="token function">get</span>');
	});

	test('marks Go keywords and raw strings', () => {
		const html = highlightCode('func main() { s := `raw` }', 'go');
		expect(html).toContain('<span class="token keyword">func</span>');
		expect(html).toContain('<span class="token string">`raw`</span>');
	});
});
