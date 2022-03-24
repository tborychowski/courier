<div class="tracking-number">
	{#if (link)} <a href="{link}" target="_blank" title="{courier}">{value}</a>
	{:else} {value}
	{/if}
</div>

<script>
export let courier = '';
export let value = '';
let link;
const linkMap = {
	'an-post': 'https://www.anpost.com/Post-Parcels/Track/History?item=',
	'dpd': 'https://tracking.dpd.de/status/en_US/parcel/',
	'ups': 'https://www.ups.com/mobile/track?trackingNumber=',
	'usps': 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=',
};

$:{
	if (linkMap[courier]) link = linkMap[courier] + value;
}
</script>
