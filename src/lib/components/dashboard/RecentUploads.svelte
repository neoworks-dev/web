<script lang="ts">
	import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import FilePdfIcon from 'phosphor-svelte/lib/FilePdfIcon';
	import FileDocIcon from 'phosphor-svelte/lib/FileDocIcon';
	import FileCsvIcon from 'phosphor-svelte/lib/FileCsvIcon';
	import FileXlsIcon from 'phosphor-svelte/lib/FileXlsIcon';
	import FileZipIcon from 'phosphor-svelte/lib/FileZipIcon';
	import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';

	type FileKind = 'image' | 'document';

	interface UploadedFile {
		id: string;
		name: string;
		kind: FileKind;
		ext: string;
		sizeKb: number;
		uploadedAt: Date;
	}

	const MIN = 60_000;
	const HOUR = 60 * MIN;
	const DAY = 24 * HOUR;

	const files: UploadedFile[] = [
		{ id: '1', name: 'campaign-hero-banner.png', kind: 'image', ext: 'png', sizeKb: 4304, uploadedAt: new Date(Date.now() - 12 * MIN) },
		{ id: '2', name: 'Q3-financial-report.pdf', kind: 'document', ext: 'pdf', sizeKb: 1843, uploadedAt: new Date(Date.now() - 2 * HOUR) },
		{ id: '3', name: 'team-offsite-2026.jpg', kind: 'image', ext: 'jpg', sizeKb: 6860, uploadedAt: new Date(Date.now() - 5 * HOUR) },
		{ id: '4', name: 'product-roadmap.docx', kind: 'document', ext: 'docx', sizeKb: 340, uploadedAt: new Date(Date.now() - DAY - 3 * HOUR) },
		{ id: '5', name: 'user-research-notes.csv', kind: 'document', ext: 'csv', sizeKb: 128, uploadedAt: new Date(Date.now() - DAY - 6 * HOUR) },
		{ id: '6', name: 'brand-assets-v2.zip', kind: 'document', ext: 'zip', sizeKb: 18841, uploadedAt: new Date(Date.now() - 2 * DAY) },
		{ id: '7', name: 'homepage-mockup.png', kind: 'image', ext: 'png', sizeKb: 3174, uploadedAt: new Date(Date.now() - 3 * DAY) },
		{ id: '8', name: 'invoice-2026-04.pdf', kind: 'document', ext: 'pdf', sizeKb: 96, uploadedAt: new Date(Date.now() - 4 * DAY) },
	];

	const docIcons: Record<string, { Icon: typeof FileTextIcon; color: string }> = {
		pdf: { Icon: FilePdfIcon, color: 'var(--ctx-red)' },
		doc: { Icon: FileDocIcon, color: 'var(--ctx-blue)' },
		docx: { Icon: FileDocIcon, color: 'var(--ctx-blue)' },
		csv: { Icon: FileCsvIcon, color: 'var(--ctx-green)' },
		xls: { Icon: FileXlsIcon, color: 'var(--ctx-green)' },
		xlsx: { Icon: FileXlsIcon, color: 'var(--ctx-green)' },
		zip: { Icon: FileZipIcon, color: 'var(--ctx-amber)' },
	};
	const fallbackDocIcon = { Icon: FileTextIcon, color: 'var(--ctx-violet)' };

	const imageGradients = [
		['var(--ctx-blue)', 'var(--ctx-violet)'],
		['var(--ctx-violet)', 'var(--ctx-pink)'],
		['var(--ctx-green)', 'var(--ctx-blue)'],
		['var(--ctx-amber)', 'var(--ctx-pink)'],
	];

	function fmtFileSize(kb: number): string {
		if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
		return `${Math.round(kb)} KB`;
	}

	function timeAgo(date: Date): string {
		const minutes = Math.floor((Date.now() - date.getTime()) / MIN);
		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	}
</script>

<div>
	<div class="sticky top-0 z-10 bg-elevated px-6 pt-4 pb-3 flex items-center justify-between">
		<p class="text-[11px] font-semibold text-dim uppercase tracking-caps">{files.length} files</p>
		<a
			href="/dashboard/storage"
			class="flex items-center gap-1 text-[12px] font-medium text-dim hover:text-default transition-colors duration-fast"
		>
			View all
			<ArrowRightIcon size={12} />
		</a>
	</div>

	<div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 px-6 pb-6">
		{#each files as file, i (file.id)}
			<div class="group min-w-0">
				<div class="relative aspect-square rounded-lg overflow-hidden">
					{#if file.kind === 'image'}
						{@const grad = imageGradients[i % imageGradients.length]}
						<div
							class="w-full h-full flex items-center justify-center"
							style="background: linear-gradient(135deg, {grad[0]}, {grad[1]})"
						>
							<ImageIcon size={22} color="white" weight="fill" class="opacity-90" />
						</div>
					{:else}
						{@const doc = docIcons[file.ext] ?? fallbackDocIcon}
						<div class="w-full h-full bg-raised border border-line-faint flex items-center justify-center">
							<doc.Icon size={26} color={doc.color} />
						</div>
					{/if}

					<button
						type="button"
						aria-label="Download {file.name}"
						class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-fast cursor-pointer"
					>
						<DownloadSimpleIcon size={18} color="white" />
					</button>
				</div>

				<p class="text-[11px] text-default truncate mt-1.5">{file.name}</p>
				<p class="text-[10px] text-dim font-mono truncate">{fmtFileSize(file.sizeKb)} · {timeAgo(file.uploadedAt)}</p>
			</div>
		{/each}
	</div>
</div>
