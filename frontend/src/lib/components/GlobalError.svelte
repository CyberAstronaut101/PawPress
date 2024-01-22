<script>
	import { errorStore } from '$lib/stores/errorStore.js';

	$: if ($errorStore) {
		setTimeout(() => {
			errorStore.set(null);
		}, 5000); // Clears the error after 5 seconds
	}
</script>

{#if $errorStore}
	<div class="error">
		{$errorStore}
	</div>
{/if}
