<script lang="ts">
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';

	type Sample = {
		id: string;
		label: string;
		/** Status line under the window — what the sample returns when it runs. */
		result: string;
		docsHref: string;
		docsLabel: string;
	};

	// Highlighting is hand-written markup below: four fixed marketing samples do
	// not justify a tokenizer, and static spans cost nothing to render.
	const samples: Sample[] = [
		{
			id: 'javascript',
			label: 'JavaScript',
			result: '20 events · decrypted on device',
			docsHref: '/docs/neoworks/quickstart',
			docsLabel: 'SDK quickstart'
		},
		{
			id: 'curl',
			label: 'cURL',
			result: '200 OK · access_token + refresh_token',
			docsHref: '/docs/api/oauth',
			docsLabel: 'OAuth reference'
		},
		{
			id: 'http',
			label: 'HTTP',
			result: '200 OK · application/json',
			docsHref: '/docs/api/http-api',
			docsLabel: 'HTTP reference'
		},
		{
			id: 'graphql',
			label: 'GraphQL',
			result: 'Typed end to end via the generated client',
			docsHref: '/docs/api/graphql-api',
			docsLabel: 'GraphQL reference'
		}
	];

	let activeId = $state(samples[0].id);

	function sampleById(id: string): Sample {
		const match = samples.find((sample) => sample.id === id);
		if (match) return match;
		return samples[0];
	}

	const active = $derived(sampleById(activeId));

	function tabClass(id: string): string {
		if (id === activeId) return 'border-default text-default';
		return 'border-transparent text-dim hover:text-muted';
	}

	function tabIndexFor(id: string): number {
		if (id === activeId) return 0;
		return -1;
	}

	// Roving arrow keys are what a tablist is expected to do; without them the
	// tabs are a keyboard dead end once focus lands inside.
	function selectTab(index: number): void {
		const wrapped = (index + samples.length) % samples.length;
		activeId = samples[wrapped].id;
		const tab = document.getElementById(`code-tab-${samples[wrapped].id}`);
		if (tab) tab.focus();
	}

	function onTabKey(event: KeyboardEvent, index: number): void {
		if (event.key === 'ArrowRight') selectTab(index + 1);
		else if (event.key === 'ArrowLeft') selectTab(index - 1);
		else return;
		event.preventDefault();
	}
</script>

{#snippet javascriptSample()}
	<pre class="code"><span class="com">// One config call wires OAuth, the typed client and every resource.</span>
<span class="kw">import</span> &#123; sdk &#125; <span class="kw">from</span> <span class="str">'@neoworks-dev/sdk'</span>

sdk.<span class="fn">config</span>(&#123;
  <span class="key">clientId</span>: <span class="str">'nw_client_xxxxxxxxxxxxxxxx'</span>,
  <span class="key">redirectUri</span>: <span class="str">'https://yourapp.example/callback'</span>,
  <span class="key">scopes</span>: [<span class="str">'openid'</span>, <span class="str">'calendar:read'</span>]
&#125;)

<span class="kw">await</span> sdk.auth.<span class="fn">login</span>()

<span class="com">// Decrypted inside the Vault — this app never holds the key.</span>
<span class="kw">const</span> &#123; rows &#125; = <span class="kw">await</span> sdk.calendar.<span class="fn">list</span>(&#123;
  <span class="key">filter</span>: &#123; <span class="key">start</span>: &#123; <span class="key">after</span>: <span class="str">'2026-01-01T00:00:00'</span> &#125; &#125;,
  <span class="key">sort</span>: [&#123; <span class="key">field</span>: <span class="str">'START'</span>, <span class="key">direction</span>: <span class="str">'ASC'</span> &#125;],
  <span class="key">limit</span>: <span class="num">20</span>
&#125;)

console.<span class="fn">log</span>(rows.length, <span class="str">'events'</span>)</pre>
{/snippet}

{#snippet curlSample()}
	<pre class="code"><span class="com"># Exchange the authorization code for tokens (PKCE, no client secret).</span>
<span class="fn">curl</span> <span class="kw">-X</span> POST https://oauth.neoworks.dev/oauth/token \
  <span class="kw">-H</span> <span class="str">'Content-Type: application/x-www-form-urlencoded'</span> \
  <span class="kw">-d</span> <span class="str">'grant_type=authorization_code'</span> \
  <span class="kw">-d</span> <span class="str">'client_id=nw_client_xxxxxxxxxxxxxxxx'</span> \
  <span class="kw">-d</span> <span class="str">'code_verifier=&lt;verifier&gt;'</span> \
  <span class="kw">-d</span> <span class="str">'code=&lt;code&gt;'</span>

<span class="com"># Pull a space's envelopes. The server only ever sees ciphertext.</span>
<span class="fn">curl</span> https://api.neoworks.dev/api/v1/spaces/<span class="ph">&lt;spaceId&gt;</span>/items \
  <span class="kw">-H</span> <span class="str">'Authorization: Bearer &lt;access_token&gt;'</span></pre>
{/snippet}

{#snippet httpSample()}
	<pre class="code"><span class="kw">POST</span> /graphql <span class="type">HTTP/1.1</span>
<span class="key">Host</span>: api.neoworks.dev
<span class="key">Authorization</span>: <span class="type">Bearer</span> <span class="ph">&lt;access_token&gt;</span>
<span class="key">Content-Type</span>: application/json

&#123;
  <span class="key">"query"</span>: <span class="str">"query($id: ID!) &#123; organization(id: $id) &#123; name plan &#125; &#125;"</span>,
  <span class="key">"variables"</span>: &#123; <span class="key">"id"</span>: <span class="str">"org_7f3a"</span> &#125;
&#125;</pre>
{/snippet}

{#snippet graphqlSample()}
	<pre class="code"><span class="kw">query</span> <span class="type">Workspace</span>(<span class="var">$organizationId</span>: <span class="type">ID!</span>) &#123;
  <span class="fn">organization</span>(<span class="key">id</span>: <span class="var">$organizationId</span>) &#123;
    name
    slug
    plan
  &#125;
  <span class="fn">clients</span>(<span class="key">organizationId</span>: <span class="var">$organizationId</span>) &#123;
    id
    name
  &#125;
&#125;</pre>
{/snippet}

<div
	class="overflow-hidden rounded-2xl border border-line bg-elevated/80 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] backdrop-blur-2xl"
>
	<div
		role="tablist"
		aria-label="SDK examples"
		class="flex flex-wrap items-center gap-1 border-b border-line-faint px-3"
	>
		{#each samples as sample, index (sample.id)}
			<button
				type="button"
				role="tab"
				id="code-tab-{sample.id}"
				aria-selected={sample.id === activeId}
				aria-controls="code-panel"
				tabindex={tabIndexFor(sample.id)}
				onclick={() => (activeId = sample.id)}
				onkeydown={(event) => onTabKey(event, index)}
				class="-mb-px shrink-0 border-b-2 px-3 py-3 text-[13px] font-medium transition-colors {tabClass(
					sample.id
				)}"
			>
				{sample.label}
			</button>
		{/each}
	</div>

	<div
		id="code-panel"
		role="tabpanel"
		aria-labelledby="code-tab-{active.id}"
		class="h-[500px] overflow-auto px-6 py-6 max-md:h-[360px] max-md:px-4"
	>
		{#if activeId === 'javascript'}
			{@render javascriptSample()}
		{:else if activeId === 'curl'}
			{@render curlSample()}
		{:else if activeId === 'http'}
			{@render httpSample()}
		{:else}
			{@render graphqlSample()}
		{/if}
	</div>

	<div class="flex items-center justify-between gap-4 border-t border-line-faint px-5 py-3">
		<span class="flex items-center gap-2 font-mono text-[11px] text-dim">
			<span class="size-1.5 shrink-0 rounded-full bg-green"></span>
			{active.result}
		</span>
		<a
			href={active.docsHref}
			class="flex shrink-0 items-center gap-1 text-[12px] font-medium text-muted transition-colors hover:text-default"
		>
			{active.docsLabel}
			<ArrowUpRightIcon size={12} weight="bold" />
		</a>
	</div>
</div>

<style>
	/* Dark palette (default) — tailwind 300-level hues on a near-black panel. */
	.code {
		--kw: #c4b5fd;
		--str: #86efac;
		--com: #9ca3af;
		--num: #fcd34d;
		--fn: #93c5fd;
		--type: #7dd3fc;
		--var: #f0abfc;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 13.5px;
		line-height: 1.8;
		color: var(--text-muted);
	}

	/* Light palette — 600/700-level hues so tokens stay legible on white. */
	:global([data-theme='light']) .code {
		--kw: #7c3aed;
		--str: #15803d;
		--com: #6b7280;
		--num: #b45309;
		--fn: #1d4ed8;
		--type: #0369a1;
		--var: #c026d3;
	}

	.kw {
		color: var(--kw);
		font-weight: 600;
	}
	.str {
		color: var(--str);
	}
	.com {
		color: var(--com);
		font-style: italic;
	}
	.num {
		color: var(--num);
	}
	.fn {
		color: var(--fn);
	}
	.type {
		color: var(--type);
	}
	.var {
		color: var(--var);
	}
	.key {
		color: var(--text);
	}
	/* Stand-ins the reader replaces read as prose, not as syntax. */
	.ph {
		color: var(--com);
		font-style: italic;
	}
</style>
