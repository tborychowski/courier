const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');
const logger = require('./logger');

const cachePath = path.join(__dirname, '..', 'cache');

axios.defaults.baseURL = 'https://api.trackinghive.com';


function getFname (_path) {
	const slug = _path.split(/[?#]/)[0]
		.replace(/\//g, '-')
		.replace(/^-|-$/g, '') + '.json';
	return path.join(cachePath, slug);
}


function setCache (_path, data) {
	const fname = getFname(_path);
	logger.info('Caching response for: ' + _path);
	fs.writeJSONSync(fname, data, 'utf8');
}

function clearCache (_path) {
	const fname = getFname(_path);
	logger.info('Clearing cache for: ' + _path);
	fs.unlinkSync(fname);
}


function getCache (_path, timeout = 0) {
	const fname = getFname(_path);
	if (!fs.existsSync(fname)) return;

	const now = +new Date();
	const mtime = fs.statSync(fname).mtimeMs;
	const valid_until = mtime + timeout * 1000;
	if (valid_until < now) return;

	const data = fs.readJSONSync(fname, 'utf8');
	logger.info('Using cached response for: ' + _path);
	return data;
}



function get (_path, headers = {}, cache_timeout_in_seconds) {
	const cached = getCache(_path, cache_timeout_in_seconds);
	if (cached) return Promise.resolve(cached);
	return axios
		.get(_path, { headers })
		.then(({data}) => {
			const resp = {code: data.meta.code, data: data.data };
			setCache(_path, resp);
			return resp;
		});
}


function post (_path, params, headers = {}) {
	return axios
		.post(_path, params, { headers })
		.then(({data}) => {
			clearCache('/trackings');
			return {code: data.meta.code, data: data.data };
		});
}


function del (_path, headers = {}) {
	return axios
		.delete(_path, { headers })
		.then(({data}) => {
			clearCache('/trackings');
			return {code: data.meta.code, data: data.data };
		});
}


module.exports = {
	get,
	post,
	del
};
