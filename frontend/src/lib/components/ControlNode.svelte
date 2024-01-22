<!-- Expect controlNode passed to this component -->
<script>
	// @ts-nocheck

	/**
	 * @type {{ ip_address: any; mac_address: any; number_buttons: any; adopted: any; adopted_at: any, id: any; }}
	 */
	export let controlNode;

	import { popup } from '@skeletonlabs/skeleton';
	import Button from './Button.svelte';

	const popupHover = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};

	/**
	 *
	 * @param {string} nodeId
	 */
	const adoptNode = async (nodeId) => {
		console.log('Attempting to adopt node: ' + nodeId);
		const res = await fetch('http://localhost:8080/api/v1/controlNodes/adopt/' + nodeId, {
			method: 'GET'
		});

		//

		console.log(res);
		if (res.status === 200) {
			console.log('Adopted node: ' + nodeId);
			// TODO update controlNodes array to reflect adoption
			// TODO update UI to reflect adoption
			controlNode = {
				...controlNode,
				adopted: true
			};
		} else {
			console.log('Failed to adopt node: ' + nodeId);
		}
	};
</script>

<div id="controlNodeItem" class="flex justify-between variant-soft-surface p-3 my-1">
	<div class="flex align-items-center min-w-0">
		<img class="h-16 w-16 flex-none rounded-full bg-gray-50" src="/img/control_node.svg" alt="" />
		<div class="min-w-0 flex-auto ml-3">
			<h2>{controlNode.ip_address}</h2>
			<h2>({controlNode.mac_address})</h2>
			<h2>Number Buttons: {controlNode.number_buttons}</h2>
		</div>
	</div>

	<!-- <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
        <p class="text-sm leading-6 text-gray-900">Co-Founder / CEO</p>
        <p class="mt-1 text-xs leading-5 text-gray-500">
            Last seen <time datetime="2023-01-23T13:23Z">3h ago</time>
        </p>
    </div> -->

	<!-- <div class="flex flex items-center justify-items-center"></div> -->

	<!-- <div class="flex flex-col content-center min-w-0 items-center"> -->
	<div class="flex flex items-center justify-items-center space-x-4">
		<!-- Updated line -->
		<!-- <button type="button" class="btn variant-filled-warning">Adopt</button> -->
		{#if controlNode.adopted}
			<button
				type="button"
				class="btn variant-filled-secondary"
				on:click={() => {
					window.location.href = '/button-management/' + controlNode.id;
				}}>Manage Buttons</button
			>

			<button
				type="button"
				class="btn variant-filled-success [&>*]:pointer-events-none"
				use:popup={popupHover}>Adopted</button
			>
			<button type="button" class="btn variant-filled-error">Delete</button>
		{:else}
			<button
				on:click={() => adoptNode(controlNode.id)}
				type="button"
				class="btn variant-filled-warning">Adopt</button
			>
		{/if}
	</div>
</div>

<div class="card p-4 variant-filled-success" data-popup="popupHover">
	<p>Adopted on: {controlNode.adopted_at}</p>
	<div class="arrow variant-filled-success" />
</div>
