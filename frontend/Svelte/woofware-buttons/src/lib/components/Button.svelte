<script>
	// @ts-nocheck

	/**
	 * @type {{id: string, name: string, button_number: number, icon: string, description: string, audio: string, control_node: any }}
	 */
	export let button;
	export let audioOptions;

	// Modal for editing button
	import Modal from '$lib/components/Modal.svelte';
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
	let showModal = false;

	const mediaApiUrl = import.meta.env.VITE_MEDIA_URL;

	const buttonSoundLink = mediaApiUrl + '/' + button.audio.file;
</script>

<div id="buttonItem" class="flex justify-between variant-soft-surface p-3 my-2">
	<div class="flex align-items-center min-w-0">
		<div class="flex flex-col align-items-center items-center justify-items-center space-y-4">
			<img
				class="h-16 w-16 flex-none rounded-full bg-gray-50"
				src="/img/button_img/outside.svg"
				alt=""
			/>

			<!-- <button type="button" class="btn variant-filled-success">Play</button> -->
		</div>

		<div class="min-w-0 flex-auto ml-3">
			<h2>Button ID: {button.id}</h2>
			<p><b>Button Name:</b> {button.name}</p>
			<p><b>Button Number:</b> {button.button_number}</p>
			<!-- <p>Button Icon: {button.icon}</p> -->
			<p><b>Button Description:</b> {button.description}</p>
			<!-- <p>Sound: {button.audio}</p> -->
			<!-- <p>Control Node: {button.control_node}</p> -->
			<!-- <h2>({controlNode.mac_address})</h2>
			<h2>Number Buttons: {controlNode.number_buttons}</h2> -->
			<AudioPlayer {...button.audio} />
		</div>
	</div>

	<div id="button_actions" class="flex flex items-center justify-items-center space-x-4">
		<button type="button" class="btn variant-filled-warning" on:click={() => (showModal = true)}
			>Edit</button
		>
		<button type="button" class="btn variant-filled-success">View Button History</button>
	</div>
</div>

<Modal bind:showModal>
	<h2 class="h2" slot="header">Manage Button Properties</h2>

	<div>
		<form method="POST" action="?/update">
			<input class="hidden" type="text" name="id" value={button.id} />
			<label class="label">
				<span>Button Name</span>
				<input
					required
					class="input"
					type="text"
					placeholder={button.name}
					value={button.name}
					name="name"
				/>
			</label>

			<label class="label">
				<span>Button Description</span>
				<input
					required
					class="input"
					type="text"
					placeholder="Description"
					value={button.description}
					name="description"
				/>
			</label>

			<label class="label">
				<span>Button Icon</span>
				<select required class="select" name="icon" value={button.icon}>
					<!-- {#each Object.entries(soundOptions) as [key, value] (key)}
						<option value={key}>{value}</option>
					{/each} -->
					<option value="default_button.svg">Default Button Icon - Cant Change Yet</option>
				</select>
			</label>

			<label class="label">
				<span>Button Sound</span>
				<select required class="select" name="audio" value={button.audio.id}>
					{#each audioOptions as option}
						<option value={option.id}
							>{option.name} - {option.description ? option.description : 'No Description'}</option
						>
					{/each}
				</select>
			</label>

			<button type="submit" class="btn variant-filled-primary">Submit</button>
		</form>
	</div>
</Modal>
