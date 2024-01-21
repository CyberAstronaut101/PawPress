<script>
	// @ts-nocheck

	import { page } from '$app/stores';

	import ControlNode from '$lib/components/ControlNode.svelte';
	import Button from '$lib/components/Button.svelte';

	export let data;
	// Make a request to the API for button management page
	// Need to load the control node info based on the passed page.params.controlNode
	// (/button-management/:controlNode)

	// And then load the buttons for that control node
	// Make API call build all that data in one request
	// Return as single JSON to this page

	// Once we have the JSON to ngFor over, build the button components
	// Verify CRU operations for the control node buttons
	// 2332;

	// console.log('Loading Button Management for node: ');
	// console.log($page.params.controlNode);
	// console.log(data);

	const controlNode = data.controlNode;
	const audioOptions = data.audioOptions;
	// Build the audio options for the dropdown
	// The key should be the audioOptions[x].id
	// The value should be audioOptions[x].name + audioOptions[x].description
	// Loop over each element in AudioOptions and build new object array
	// const audioOptions = data.audioOptions.map((audio) => {
	// 	return {
	// 		[audio.id]: audio.name + ' - ' + (audio.description ? audio.description : 'No Description')
	// 	};
	// });
</script>

<h1 class="h3">Button Management for Control Node</h1>

<ControlNode {controlNode} />

{JSON.stringify(audioOptions)}

<h2 class="h3">Control Node Buttons</h2>
{#each data.buttons as button}
	<!-- {JSON.stringify(button)} -->
	<!-- <ControlNode {controlNode} /> -->
	<Button {button} {audioOptions} />
{/each}
