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
			.then(res => Array.isArray(res) ? res.map(remapFields) : [])
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
	res.sort((a, b) => a.title.localeCompare(b.title));
	const _couriers = {};
	res.forEach(c => _couriers[c.slug] = c);
	_couriers['an-post'].logo = _couriers['an-post'].logo || 'courier-anpost.png';
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
		// if (data.trackings.address) {
		// 	const _from = data.trackings.address.ship_from;
		// 	const _to = data.trackings.address.ship_to;
		// 	if (_from) {
		// 		_data.addrFrom = [_from.address_line1, _from.city, _from.country_name]
		// 			.filter(s => s && s.length)
		// 			.join(', ');
		// 	}
		// 	if (_to) {
		// 		_data.addrTo = [_to.address_line1, _to.city, _to.country_name]
		// 			.filter(s => s && s.length)
		// 			.join(', ');
		// 	}
		// }

		if (data.trackings.shipment_pickup_date) {
			const pickupDate = new Date(data.trackings.shipment_pickup_date);
			_data.pickupDate = pickupDate.toDateString() + ', ' + pickupDate.toLocaleTimeString();
			_data.pickupAgo = data.trackings.delivery_time;
			_data.pickupAgo += ` day${_data.pickupAgo === 1 ? '' : 's'} ago`;
		}
		else {
			_data.pickupDate = '';
			_data.pickupAgo = '?';
		}

		if (_data.status === 'Delivered') {
			_data.expected = '';
			_data.expectedIn = 'delivered';
		}
		else if (data.trackings.expected_delivery) {
			const [yr, mo, day] = (data.trackings?.expected_delivery || '').split('-');
			const d = new Date(yr, mo - 1, day);
			_data.expected = d.toDateString();

			const today = new Date();
			const todayIso = today.toISOString().substr(0, 10);
			if (todayIso === data.trackings.expected_delivery) _data.expectedIn = 'today';
			else {
				const _expectedIn = Math.ceil((+d - +today) / 86400000);
				if (_expectedIn > 1) _data.expectedIn = 'in ' + _expectedIn + ' days';
				else if (_expectedIn === 1) _data.expectedIn = 'tomorrow';
				else if (_expectedIn === 0) _data.expectedIn = 'today';
				else if (_expectedIn < 0) _data.expectedIn = 'delayed';
				else _data.expectedIn = '?';
			}
		}
		else {
			_data.expected = '';
			_data.expectedIn = '?';
		}

		if (data.trackings.checkpoints) {
			_data.checkpoints = data.trackings.checkpoints.map(p => {
				return { time: p.checkpoint_time, location: p.location, msg: p.message };
			});
		}
	}
	return _data;
}
