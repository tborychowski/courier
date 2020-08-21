<header class="header">
	<h1>Courier</h1>
	<form on:submit|preventDefault="{add}" class:loading>
		<input type="text" bind:value="{tracking_number}" placeholder="tracking number">
		<input type="text" bind:value="{title}" placeholder="title (optional)">
		<div class="select-wrap">
			<select bind:value="{courier}">
				{#each Object.values($couriers) as cur}
					<option value="{cur.slug}">{cur.title}</option>
				{/each}
			</select>
		</div>
		<button class="btn success text-icon" title="Add tracking">&plus;</button>
	</form>
</header>


<script>
import {EVENT, couriers, trackings} from '../lib';

let tracking_number = '';
let title = '';
let courier = '';
let loading = false;

const resetCourier = () => courier = Object.values($couriers)[0].slug;


function add () {
	if (loading) return;
	if (!courier) resetCourier();
	if (!courier || !tracking_number) return alert('Enter tracking number!');
	loading = true;
	trackings
		.add({ tracking_number, title, courier })
		.then(res => {
			EVENT.fire(EVENT.tracking.added, res);
			tracking_number = '';
			title = '';
			loading = false;
			resetCourier();
		});
}

</script>
