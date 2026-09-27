<script lang="ts">
	import SectionHeading from '$lib/components/landing/SectionHeading.svelte';
	import BenchmarkTable from '$lib/components/vitals/BenchmarkTable.svelte';
	import BetsGrid from '$lib/components/vitals/BetsGrid.svelte';
	import FiveTools from '$lib/components/vitals/FiveTools.svelte';
	import InstallSection from '$lib/components/vitals/InstallSection.svelte';
	import LanguageSupport from '$lib/components/vitals/LanguageSupport.svelte';
	import ResolverTable from '$lib/components/vitals/ResolverTable.svelte';
	import VitalsCta from '$lib/components/vitals/VitalsCta.svelte';
	import VitalsHero from '$lib/components/vitals/VitalsHero.svelte';
</script>

<VitalsHero />

<section id="tools" class="scroll-mt-32 px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="The five tools"
			title="Five questions your agent asks on every task."
			subtitle="Every block below is real output, trimmed where it ran long. Plain text, under a hard token cap, with a file:line on every claim and a resolver tag on every edge."
		/>
		<div class="mt-12">
			<FiveTools />
		</div>
	</div>
</section>

<section id="bets" class="scroll-mt-32 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="What it is betting on"
			title="A tool that hides its own uncertainty is worse than no tool."
			subtitle="Because the agent acts on it anyway. Six decisions that follow from that, each of them visible in the output."
		/>
		<div class="mt-12">
			<BetsGrid />
		</div>
	</div>
</section>

<section id="benchmark" class="scroll-mt-32 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Benchmark"
			title="Same agent, same model, same repo. One thing varied."
			subtitle="Seven discovery tasks on the gyro compiler — 236 .gyro, 130 .go, 38 .c, 29 .h. The control is that agent with grep and file reads and nothing else."
		/>
		<div class="mt-12">
			<BenchmarkTable />
		</div>
	</div>
</section>

<section id="output" class="scroll-mt-32 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Reading the output"
			title="When a compiler resolved it, it says so."
			subtitle="When a grammar just saw a matching word, it says that instead. Two conventions carry through every answer."
		/>
		<div class="mt-12">
			<ResolverTable />
		</div>
	</div>
</section>

<section id="languages" class="scroll-mt-32 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Languages"
			title="Semantic where a compiler will answer, lexical where it will not."
			subtitle="And labelled either way, so an agent never mistakes one for the other."
		/>
		<div class="mt-12">
			<LanguageSupport />
		</div>
	</div>
</section>

<section id="install" class="scroll-mt-32 border-t border-line-faint px-6 py-24 max-md:py-16">
	<div class="mx-auto max-w-[1120px]">
		<SectionHeading
			eyebrow="Install"
			title="That is the whole setup."
			subtitle="Two commands to see it yourself, one JSON block to give it to your agent."
		/>
		<div class="mt-12">
			<InstallSection />
		</div>
	</div>
</section>

<VitalsCta />
