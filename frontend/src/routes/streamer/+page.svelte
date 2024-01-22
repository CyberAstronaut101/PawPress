<!-- https://stackoverflow.com/questions/69151604/how-to-access-websocket-in-svelte -->

<script>
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';

	const mediaApiUrl = import.meta.env.VITE_MEDIA_URL;

	/**
	 * @type {any[]}
	 */
	let audioQueue = [];
	let isAudioPlaying = false;
	let audio = null;

	/**
	 * @type {any[]}
	 */
	let messageLog = [];

	async function playNextAudio() {
		if (audioQueue.length > 0 && !isAudioPlaying) {
			isAudioPlaying = true;
			const audioSrc = audioQueue.shift();
			const audio = new Audio(mediaApiUrl + '/' + audioSrc);
			await audio.play();
			audio.onended = () => {
				isAudioPlaying = false;
				playNextAudio();
			};
		}
	}

	// Open the WebSocket connection with the buttonListener ws endpoint
	if (browser) {
		const socket = new WebSocket('ws://localhost:8080/api/v1/buttons/buttonListener');
		socket.addEventListener('open', () => {
			console.log('Opened');
		});

		socket.addEventListener('message', (event) => {
			console.log('Message from server ', event.data);

			// Cast event.data to object
			let eventData = JSON.parse(event.data);

			// console.log('Audio File');
			// console.log(eventData.audio.file);
			// TODO Play the audio file
			// audio = new Audio(mediaApiUrl + '/' + eventData.audio.file);

			audioQueue.push(eventData.audio.file);
			playNextAudio();
			// console.log('Playing Audio');
			// audio.play();
			//
			messageLog = [event.data, ...messageLog];
		});

		socket.addEventListener('error', (event) => {
			console.log('Error from server ', event);
		});

		onDestroy(() => {
			if (socket && socket.readyState == 1) {
				socket.close();
			}
		});
	}

	// Audio Play Options
	function playAudio() {
		audio.play();
	}
</script>

{#each messageLog.reverse() as message}
	<p>{message}</p>
{/each}

<button on:click={playAudio}>Play Audio</button>
