<main class="main">
	{#if loading}
		<div class="placeholder-text">Loading...</div>
	{:else}
		{#if $trackings && $trackings.length}
			{#each $trackings as tracking}
				<Tracking data="{tracking}"/>
			{/each}
		{:else if firstTimeLoaded}
			<div class="placeholder-text">No trackings found.</div>
		{/if}
	{/if}
</main>


<script>
import {onMount} from 'svelte';
import {EVENT, trackings} from '../lib';
import Tracking from './tracking';
let loading = false;
let firstTimeLoaded = false;

onMount(() => {
	EVENT.on(EVENT.tracking.added, loadData);
	EVENT.on(EVENT.tracking.deleted, loadData);
	loadData();
});


function loadData () {
	loading = true;
	trackings
		.load()
		.then(() => {
			firstTimeLoaded = true;
			loading = false;
		});
}

</script>
