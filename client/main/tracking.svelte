<div class="tracking">
	<header>
		<img src="{courier.logo}" class="logo" alt="{courier.title}">
		<div class="status">{data.status}</div>
		<h2 title="{data.tracking_number}">{data.title || 'Parcel'}</h2>
		<div class="expected">
			Expected: {@html expectedIn}
			{#if data.expected} ({data.expected}){/if}
		</div>
		<div class="flex-spacer"></div>
		<div class="tracking-number">{data.tracking_number}</div>
	</header>

	{#if data.checkpoints.length}
	<details>
  		<summary>Checkpoints</summary>
		<table class="checkpoints">
		<thead><tr>
			<td class="col-date">Date</td>
			<td class="col-location">Location</td>
			<td class="col-status">Status</td>
		</tr></thead>
		<tbody>
			{#each data.checkpoints as checkpoint}
				<tr>
					<td>{(checkpoint.time || '').replace('T', ' ')}</td>
					<td>{checkpoint.location}</td>
					<td>{checkpoint.msg}</td>
				</tr>
			{/each}
		</tbody>
		</table>
	</details>
	{/if}

	<footer>
		<div class="flex-spacer"></div>
		<button class="btn" on:click="{() => delTracking(data.id)}">Delete</button>
	</footer>
</div>


<script>

import {EVENT, trackings, couriers} from '../lib';
export let data = {};
$:courier = $couriers[data.courier] || {};
$:expectedIn = data.expectedIn ?
	(data.expectedIn === 1 ? '<em>tomorrow</em>' : `in <em>${data.expectedIn} days</em>`) :
	'?';

function delTracking (id) {
	if (confirm('Are you sure you want to delete this tracking?')) {
		trackings.del(id).then(res => EVENT.fire(EVENT.tracking.deleted, res));
	}
}

</script>
