<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';

	import ApiMessages from '$lib/components/ApiMessages.svelte';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import message from '$lib/ApiMessage';

	import GlobalError from '$lib/components/GlobalError.svelte';
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">WoofWare</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a class="btn btn-sm variant-ghost-surface" href="/streamer"> Streamer </a>

				<a class="btn btn-sm variant-ghost-surface" href="/button-management">
					Button Management
				</a>

				<a class="btn btn-sm variant-ghost-surface" href="/control-node">
					Control Node Management
				</a>

				<a class="btn btn-sm variant-ghost-surface" href="/history"> History </a>
				<a class="btn btn-sm variant-ghost-surface" href="/audio-management"> Manage Audio </a>
			</svelte:fragment>
		</AppBar>

		<GlobalError />
	</svelte:fragment>
	<!-- Page Route Content -->
	<div id="main-wrapper" class="max-xl p-5">
		<slot />
	</div>

	<!-- <svelte:fragment slot="pageFooter">
		<ApiMessages />
	</svelte:fragment> -->
</AppShell>
