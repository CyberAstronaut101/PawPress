<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
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
				<a class="btn btn-sm variant-ghost-surface" href="/"> Dashboard </a>

				<a class="btn btn-sm variant-ghost-surface" href="/button-management">
					Button Management
				</a>

				<a class="btn btn-sm variant-ghost-surface" href="/control-node">
					Control Node Management
				</a>

				<a class="btn btn-sm variant-ghost-surface" href="/history"> History </a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<div id="main-wrapper" class="max-xl p-5">
		<slot />
	</div>
</AppShell>
