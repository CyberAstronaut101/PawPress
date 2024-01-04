<script>
	// import ControlNodeIcon from '$lib/images/control-node.svg';
	import ControlNode from '$lib/components/ControlNode.svelte';

	// Loading Server Side Data
	export let data;
	// console.log('Data on page load: ');
	// console.log(data);

	let controlNodes = data.data.controlNodes;
</script>

<!-- <ul role="list" class="divide-y divide-gray-100"> -->
<div class="flex flex-col">
	{#each controlNodes as controlNode}
		<ControlNode {controlNode} />
	{/each}
	<!-- </ul> -->
</div>

<hr />

<div class="m-5 p-5">
	<!-- <div class="flex justify-between gap-x-6 py-5 variant-soft-surface m-5"> -->
	<div class="variant-soft-surface p-3 m-5">
		<div class="flex min-w-0">
			<img class="h-16 w-16 flex-none rounded-full bg-gray-50" src="/img/control_node.svg" alt="" />
			<div class="min-w-0 flex-auto">
				<h2>test</h2>
			</div>
		</div>
	</div>
</div>
