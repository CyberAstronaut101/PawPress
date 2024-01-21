<script>
	// @ts-nocheck
	import { errorStore } from '$lib/stores/errorStore.js';

	import AudioClip from '$lib/components/AudioClip.svelte';

	// Get the backend API URL
	const apiURL = import.meta.env.VITE_API_URL;

	export let data; // return data from the +page.server init load func

	import { onMount } from 'svelte';
	let media = [];
	let mediaRecorder = null;
	let audioSrc = '';

	let audioBlob = null;

	let uploadFormError = null;

	onMount(async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		mediaRecorder = new MediaRecorder(stream);
		mediaRecorder.ondataavailable = (e) => media.push(e.data);
		mediaRecorder.onstop = function () {
			const blob = new Blob(media, { type: 'audio/ogg; codecs=opus' });
			audioBlob = blob;
			media = []; //<-- We reset our media array
			audioSrc = window.URL.createObjectURL(blob);
		};
	});

	function startRecording() {
		mediaRecorder.start();
	}

	function stopRecording() {
		mediaRecorder.stop();
	}

	function uploadRecording() {
		// const blob = new Blob(media, { type: 'audio/ogg; codecs=opus' });

		// Create a file from the blob with a specific file name
		const name = document.querySelector('input[name="name"]').value.trim();
		// make a copy of name called fileName - lowewrcase string and replace spaces with underscores
		const fileName = name.toLowerCase().replaceAll(' ', '_') + '.ogg';

		// Only upload if there is an actual audioBlob to upload..
		// check and make sure size is greater than 0kb
		if (audioBlob === null || audioBlob.size <= 0) {
			console.log('No audio blob to upload');
			uploadFormError = 'No Audio to Upload. Please record audio first.';
			return;
		}

		const audioFile = new File([audioBlob], fileName, { type: 'audio/ogg: codecs=opus' });

		const formData = new FormData();
		formData.append('name', name);
		formData.append('audioClip', audioFile);

		console.log('Form Data For Audio Clip Create Post');
		console.log(formData);
		fetch(apiURL + '/audio', {
			// headers: {
			// 	'Content-Type': 'multipart/form-data'
			// },
			method: 'POST',
			body: formData
		})
			.then((response) => response.json())
			.then((data) => {
				console.log('Success:', data);
				// Handle Successful response
			})
			.catch((error) => {
				console.error('Error:', error);
				// Handle Error
				errorStore.set(error);
			});
	}

	import Modal from '$lib/components/Modal.svelte';

	let showModal = false;

	// https://remarkablemark.org/blog/2021/01/02/record-microphone-audio-on-webpage/
	// https://cptcrunchy.medium.com/how-to-build-a-voice-recorder-with-sveltekit-d331e3e94af6
</script>

<!-- <section>
	<audio controls />
	<button on:click={startRecording}>Record</button>
	<button on:click={stopRecording}>Stop</button>
</section>

<audio src="http://localhost:8080/media/test_outside.ogg" type="audio/ogg"></audio>

<audio controls>
	<source src="http://localhost:8080/media/test_outside.ogg" type="audio/ogg" />
	Your browser does not support the audio element.
</audio>
 -->

<button type="button" on:click={() => (showModal = true)} class="btn variant-filled-success"
	>Create New Audio</button
>

<!-- List out all the audio options on the server -->

{#each data.audioClips as audioClip}
	<!-- {JSON.stringify(audioClip)} -->

	<AudioClip {audioClip} />
	<!-- <audio controls>

		<source src="http://localhost:8080/media/{audioClip.file}" type="audio/ogg" />
		Your browser does not support the audio element.
	</audio> -->
{/each}

<Modal bind:showModal>
	<h2 class="h2 uppercase" slot="header">New Audio Clip</h2>

	{#if uploadFormError !== null}
		<div class="variant-filled-error p-3 m-1">{uploadFormError}</div>
	{/if}

	<form method="POST" action="?/update">
		<label class="label">
			<span>Audio Name</span>
			<input
				required
				class="input"
				type="text"
				placeholder="New Audio Name - Best to name the same word that the audio clip is of"
				name="name"
			/>
		</label>

		<section>
			<audio controls src={audioSrc} />
			<button type="button" class="btn variant-filled-error" on:click={startRecording}
				>Start Recording</button
			>
			<button type="button" class="btn variant-filled-warning" on:click={stopRecording}
				>Stop Recording</button
			>

			<button type="button" class="btn variant-filled-primary" on:click={uploadRecording}
				>Submit</button
			>
		</section>
	</form>

	<ol class="definition-list">
		<!-- <form method="POST" on:submit|preventDefault={uploadRecording}></form>
			<label class="label">
				<span>Sound Name</span>
				<input required class="input" type="text" placeholder="New Sound Name" name="name" />
			</label>

			<button type="submit" class="btn variant-filled-primary">Submit</button>
		</form> -->
	</ol>
</Modal>
