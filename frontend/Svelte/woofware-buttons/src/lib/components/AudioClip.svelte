<script>
	/**
	 * @type {{ name: string; description: string; file: string; } }}
	 */
	export let audioClip;

	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
</script>

<div id="audioClipItem" class="flex flex-col justify-between variant-soft-surface p-3 my-2">
	<h3 class="h3">{audioClip.name}</h3>
	{audioClip.description ? audioClip.description : 'No Description for audio clip'}

	<div class="flex align-items-center min-w-0 p-3">
		<div class="min-w-0 flex-auto ml-3">
			<AudioPlayer {...audioClip} />
		</div>
	</div>

	<Accordion>
		<AccordionItem>
			<!-- <svelte:fragment slot="lead">(icon)</svelte:fragment> -->
			<svelte:fragment slot="summary">Audio Clip Button Usage</svelte:fragment>
			<svelte:fragment slot="content"
				>TODO Get graph relationship to select all from the button objects with this audio mapped to
				it</svelte:fragment
			>
		</AccordionItem>
		<AccordionItem>
			<!-- <svelte:fragment slot="lead">(icon)</svelte:fragment> -->
			<svelte:fragment slot="summary">AudioClip Options</svelte:fragment>
			<svelte:fragment slot="content">
				<section>
					<!-- <audio controls src={audioSrc} /> -->
					<button type="button" class="btn variant-filled-error">Start Recording</button>
					<button type="button" class="btn variant-filled-warning">Stop Recording</button>

					<button type="button" class="btn variant-filled-primary">Submit</button>
				</section>
			</svelte:fragment>
		</AccordionItem>
		<!-- ... -->
	</Accordion>
</div>
