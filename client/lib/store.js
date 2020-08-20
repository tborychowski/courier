import {writable} from 'svelte/store';
import * as api from './request';

export const couriers = writable([]);
export const trackings = trackingsStore();


function trackingsStore () {
	const { subscribe, set } = writable(0);
	set([]);
	return {
		subscribe,
		load: () => api.get('/trackings')
			.then(res => res.map(remapFields))
			.then(sortByDate)
			.then(set),
		add: (data) => api.post('/trackings', data).then(res => {
			if (res.code !== 200 && res.msg) alert(res.msg);
		}),
		del: (id) => api.del('/trackings/' + id),
	};
}



api.get('/courier').then(res => {
	if (!res) return;
	const _couriers = {};
	res.forEach(c => _couriers[c.slug] = c);
	couriers.set(_couriers);
});


function sortByDate (data) {
	data.sort((a, b) => a.sortField - b.sortField);
	return Promise.resolve(data);
}


function remapFields (data) {
	const _data = { id: data._id };
	_data.tracking_number = data.tracking_number;
	_data.title = data.custom_fields && data.custom_fields.title || '';
	_data.status = data.current_status;
	_data.courier = data.slug;
	_data.pickup_date = data.trackings && data.trackings.shipment_pickup_date || null;
	_data.sortField = +(_data.pickup_date ? new Date(_data.pickup_date) : new Date());

	if (data.trackings) {
		if (data.trackings.address) {
			const _from = data.trackings.address.ship_from;
			const _to = data.trackings.address.ship_to;

			if (_from) {
				_data.addrFrom = [_from.address_line1, _from.city, _from.country_name]
					.filter(s => s && s.length)
					.join(', ');
			}
			if (_to) {
				_data.addrTo = [_to.address_line1, _to.city, _to.country_name]
					.filter(s => s && s.length)
					.join(', ');
			}
		}

		if (data.trackings.expected_delivery) {
			const d = new Date(data.trackings.expected_delivery);
			_data.expected = d.toDateString();
			const _expectedIn = Math.ceil((+d - +new Date()) / 86400000);
			if (_expectedIn > 0) _data.expectedIn = _expectedIn;
		}

		if (data.trackings.checkpoints) {
			_data.checkpoints = data.trackings.checkpoints.map(p => {
				return { time: p.checkpoint_time, location: p.location, msg: p.message };
			});
		}
	}
	return _data;
}
