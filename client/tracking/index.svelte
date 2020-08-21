<div class="tracking">
	<header>
		<img src="{courier.logo}" class="logo" alt="{courier.title}">
		<div class="status">{data.status}</div>
		<h2 title="{data.tracking_number}">{data.title || 'Parcel'}</h2>
		<div class="flex-spacer"></div>
		<TrackingNumber courier="{data.courier}" value="{data.tracking_number}" />
	</header>
	<div class="sub-header">
		<table>
			<tr><td class="lbl">Expected:</td><td class="val highlight">{data.expected} (<em>{data.expectedIn}</em>)</td></tr>
			<tr><td class="lbl">Picked up:</td><td class="val">{data.pickupDate} ({data.pickupAgo})</td></tr>
		</table>
	</div>
	<footer>
		<div class="details">
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
		</div>
		<div class="flex-spacer"></div>
		<button class="btn text-icon"
			on:click="{() => delTracking(data.id)}" title="Delete tracking">&times;</button>

	</footer>
</div>


<script>
import TrackingNumber from './tracking-number';
import {EVENT, trackings, couriers} from '../lib';
export let data = {};
$:courier = $couriers[data.courier] || {};

function delTracking (id) {
	if (confirm('Are you sure you want to delete this tracking?')) {
		trackings.del(id).then(res => EVENT.fire(EVENT.tracking.deleted, res));
	}
}

</script>
