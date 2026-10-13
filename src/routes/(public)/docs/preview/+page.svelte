<script lang="ts">
	import Callout from '$lib/components/docs/Callout.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';
	import CodeAside from '$lib/components/docs/CodeAside.svelte';
	import Endpoint from '$lib/components/docs/Endpoint.svelte';
	import DocArticle from '$lib/components/docs/DocArticle.svelte';
	import PageFeedback from '$lib/components/docs/PageFeedback.svelte';
	import PrevNext from '$lib/components/docs/PrevNext.svelte';
	import MarginNote from '$lib/components/docs/MarginNote.svelte';
	import PackageInstall from '$lib/components/docs/PackageInstall.svelte';
	import RequestExample from '$lib/components/docs/RequestExample.svelte';
	import Terminal from '$lib/components/docs/Terminal.svelte';

	const createNode = {
		method: 'POST',
		path: '/v1/nodes',
		description: 'Create a node under a parent',
		requests: [
			{
				label: 'curl',
				language: 'bash',
				code: `curl -X POST https://api.neoworks.dev/v1/nodes \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"parent": "node_01", "kind": "event"}'`
			},
			{
				label: 'TypeScript',
				language: 'ts',
				code: `const { events } = neoworks.collection(calendar)

// Creates the node and uploads its encrypted payload
const standup = await events.create({ title: "Standup", start, end })`
			},
			{
				label: 'Kotlin',
				language: 'kotlin',
				code: `val events = neoworks.collection(calendar).events

// Creates the node and uploads its encrypted payload
val standup = events.create(title = "Standup", start = start, end = end)`
			},
			{
				label: 'Go',
				language: 'go',
				code: `events := neoworks.Collection(calendar).Events

// Creates the node and uploads its encrypted payload
standup, err := events.Create(ctx, neoworks.Event{Title: "Standup", Start: start, End: end})`
			}
		],
		response: {
			status: 201,
			statusText: 'Created',
			body: { id: 'node_7f3a', parent: 'node_01', kind: 'event', version: 1 }
		}
	} as const;

	const notFound = {
		method: 'GET',
		path: '/v1/nodes/node_missing',
		requests: [
			{
				label: 'curl',
				language: 'bash',
				code: 'curl https://api.neoworks.dev/v1/nodes/node_missing -H "Authorization: Bearer $ACCESS_TOKEN"'
			}
		],
		response: { status: 404, statusText: 'Not Found', body: { error: 'node not found' } }
	} as const;
</script>

<DocArticle
	title="Docs components"
	description="Every building block a docs page can use. Import each from $lib/components/docs."
	glance={[
		{ label: 'Package', value: '@neoworks-dev/sdk' },
		{ label: 'Runs on', value: 'Browsers and Node' },
		{ label: 'Source', value: 'GitHub', href: 'https://github.com/neoworks-dev/neoworks.dev' }
	]}
	related={[
		{ label: 'Quickstart', href: '/docs/sdk/quickstart', description: 'Sign in and create your first item.' },
		{ label: 'OAuth', href: '/docs/neoworks/oauth', description: 'How apps are authorized.' }
	]}
>
	<h2>Callouts</h2>
	<Callout kind="note">A note adds context the reader can skip. It can hold <code>inline code</code>.</Callout>
	<Callout kind="tip" title="Use the handle">Tips point at a faster or nicer way to do something.</Callout>
	<Callout kind="warning">Warnings cover things that work but might surprise you.</Callout>
	<Callout kind="danger" title="Shown once">
		Danger is for data loss or secrets. This token is only shown once.
	</Callout>

	<h2>Margin notes</h2>
	<MarginNote>Sticky notes carry asides that do not need a whole callout.</MarginNote>
	<p>
		A margin note floats into the right margin level with the paragraph after it, and sits in the text
		on narrower screens. Use it for a short aside, such as where a value comes from or why a default
		was chosen.
	</p>
	<p>Notes in a row stack under each other instead of overlapping, so a few can follow one another.</p>

	<h2>Code blocks</h2>
	<p>Fenced code in markdown gets the same header and copy button. Components can use it directly:</p>
	<CodeBlock
		language="ts"
		filename="calendar.ts"
		code={`import Neoworks from "@neoworks-dev/sdk"

const neoworks = new Neoworks({ client: "neoworks-calendar" }) // the app's client id
const user = await neoworks.ready()`}
	/>
	
	<h2>Terminal</h2>
	<p>Install commands switch between package managers, and the choice sticks across the page and visits:</p>
	<PackageInstall name="@neoworks-dev/sdk" />
	<p>Any other command, with several lines if needed:</p>
	<Terminal tabs={[{ label: 'shell', command: 'git clone https://github.com/neoworks-dev/neoworks.dev\ncd neoworks.dev && bun install' }]} />

	<h2>Endpoints</h2>
	<p>
		An endpoint pairs a section of the page with its request. On wide screens the example sits in the
		right margin, level with the top of the section and marked by a highlighter bar, and it stays in
		view while you read the section. Below that width it follows the text.
	</p>

	<Endpoint {...createNode}>
		<h3>Create a node</h3>
		<p>
			Send the parent and the kind of node to create. The server answers with the new node's id and
			version. Each language has its own tab, and the reader's choice stays on that example.
		</p>
		<p>
			The response is the same for every language, since it is the same call. Every example shows
			what the server really returns, copied from a real call, not what we expect it to return.
		</p>
		<Callout kind="tip">Anything can go in the section: callouts, tables, lists and code.</Callout>
		<p>
			A longer section keeps its example pinned for longer, which is the point: the request stays
			next to the explanation while you read it.
		</p>
	</Endpoint>

	<Endpoint {...notFound}>
		<h3>Errors</h3>
		<p>Errors show the same way, with a red status. Asking for a node that does not exist returns a 404.</p>
	</Endpoint>

	<h2>Code beside text</h2>

	<CodeAside language="ts" filename="signin.ts" code={`const user = await neoworks.ready()

if (user === null) {
  await neoworks.signin()
}`}>
		<p>
			Not every page has an API call. Any code can sit in the margin beside the section that explains
			it, pinned while the section is read.
		</p>
		<p>
			The first line restores a session from an earlier visit. When there is none, the second part
			starts the sign-in flow.
		</p>
		<p>Longer sections keep the code in view for longer.</p>
	</CodeAside>

	<h2>Page footer</h2>
	<PrevNext
		previous={{ label: 'Quickstart', href: '/docs/sdk/quickstart' }}
		next={{ label: 'Sign-in', href: '/docs/sdk/signin' }}
	/>
	<div class="mt-8"><PageFeedback pathname="/docs/preview" pageTitle="Docs components" /></div>
</DocArticle>
