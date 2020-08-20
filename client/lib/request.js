function req (url, method = 'GET', params) {
	const opts = {
		method: method,
		headers: { 'Content-Type': 'application/json' }
	};
	if (params) {
		opts.body = JSON.stringify(params);
		if (params.id) url += `/${params.id}`;
	}
	return fetch(`api${url}`, opts).then(res => res.json());
}

export const get = url => req(url);
export const post = (url, params) => req(url, 'POST', params);
export const del = url => req(url, 'DELETE');
