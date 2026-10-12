<script lang="ts">
	import ScrapItem from './ScrapItem.svelte';
	import PaperclipIcon from 'phosphor-svelte/lib/PaperclipIcon';
	import FilePdfIcon from 'phosphor-svelte/lib/FilePdfIcon';
	import PhoneIcon from 'phosphor-svelte/lib/PhoneIcon';
	import CakeIcon from 'phosphor-svelte/lib/CakeIcon';
	import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
	import FlowerTulipIcon from 'phosphor-svelte/lib/FlowerTulipIcon';
</script>

{#snippet polaroid(image: string, caption: string, width: string)}
	<figure class="bg-surface p-2.5 pb-1 shadow-[0_8px_24px_rgba(0,0,0,0.14)]" style="width: {width}">
		<img src={image} alt="" draggable="false" class="aspect-square w-full object-cover" />
		<figcaption class="py-1.5 text-center font-hand text-xl leading-none text-muted">
			{caption}
		</figcaption>
	</figure>
{/snippet}

<ScrapItem left="-1%" top="15%" rotate={-12} delay={300}>
	{@render polaroid('/hero/3768884.jpg', 'Lisbon, Sunday', '196px')}
</ScrapItem>

<ScrapItem left="13%" top="11%" rotate={9} delay={450} tape="none" class="max-md:hidden">
	{@render polaroid('/hero/5384447.jpg', 'Summer \'26', '128px')}
</ScrapItem>

<ScrapItem left="4%" top="47%" rotate={-6} delay={550} tape="corners" class="max-md:hidden">
	<div class="w-[236px] rounded-sm bg-surface px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
		<p class="text-[15px] font-semibold tracking-tight text-default">Lena Hoffmann</p>
		<p class="text-xs text-dim">Berlin · friends since 2014</p>
		<div class="mt-3 flex flex-col gap-1 text-xs text-muted">
			<span class="flex items-center gap-1.5"><PhoneIcon size={12} /> +49 30 555 0184</span>
			<span class="flex items-center gap-1.5"><CakeIcon size={12} /> 2 March</span>
		</div>
	</div>
</ScrapItem>

<ScrapItem left="83%" top="9%" rotate={11} delay={400}>
	<div class="w-[168px] overflow-hidden rounded-sm bg-surface text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
		<div class="bg-brand py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-fg">
			October
		</div>
		<p class="pt-2 text-5xl font-semibold tracking-tight text-default">16</p>
		<p class="text-xs uppercase tracking-[0.15em] text-dim">Friday</p>
		<p class="px-3 pb-3 pt-2 font-hand text-xl leading-tight text-brand">Dinner at Lena's, 19:30</p>
	</div>
</ScrapItem>

<ScrapItem left="78%" top="40%" rotate={-8} delay={650}>
	{@render polaroid('/hero/8445576.jpg', 'Wannsee', '204px')}
</ScrapItem>

<ScrapItem left="15%" top="70%" rotate={-11} delay={800} tape="none">
	<div
		class="flex size-[150px] items-center justify-center bg-note p-4 text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
	>
		<p class="font-hand text-[26px] leading-[1.05] text-default">No ads. No tracking.</p>
	</div>
</ScrapItem>

<ScrapItem left="29%" top="86%" rotate={-5} delay={900} tape="none" class="max-md:hidden">
	<div class="relative w-[200px] rounded-sm bg-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
		<PaperclipIcon size={34} class="absolute -top-4 left-6 -rotate-12 text-faint" />
		<div class="flex items-center gap-2.5">
			<FilePdfIcon size={28} weight="duotone" class="text-brand" />
			<div>
				<p class="text-[13px] font-medium text-default">Passport scan.pdf</p>
				<p class="text-2xs text-dim">Drive · 2.4 MB</p>
			</div>
		</div>
	</div>
</ScrapItem>

<ScrapItem left="64%" top="80%" rotate={7} delay={1000} tape="none" class="max-md:hidden">
	<div class="relative w-[244px] bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
		<!-- Envelope flap. -->
		<div
			class="h-14 w-full bg-hover [clip-path:polygon(0_0,100%_0,50%_100%)]"
		></div>
		<div class="px-4 pb-4 pt-1">
			<p class="text-[13px] font-medium text-default">Re: recipe for Friday</p>
			<p class="mt-0.5 font-hand text-lg leading-tight text-muted">
				Vegetarian please, and I'll bring the bread!
			</p>
		</div>
		<span
			class="absolute right-3 top-3 flex size-9 items-center justify-center border-2 border-dashed border-brand/50 font-hand text-sm text-brand"
		>
			1.10
		</span>
	</div>
</ScrapItem>

<ScrapItem left="90%" top="64%" rotate={14} delay={1100} tape="none" class="max-md:hidden">
	{@render polaroid('/hero/4005032.jpg', 'Hike, day 3', '170px')}
</ScrapItem>

<ScrapItem left="27%" top="58%" rotate={-28} delay={1200} tape="top" class="max-md:hidden">
	<LeafIcon size={84} weight="fill" class="text-ridge-mid opacity-90" />
</ScrapItem>

<ScrapItem left="74%" top="74%" rotate={18} delay={1250} tape="none" class="max-md:hidden">
	<FlowerTulipIcon size={64} weight="fill" class="text-brand opacity-80" />
</ScrapItem>
