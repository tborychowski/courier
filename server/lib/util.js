const env = process.env.NODE_ENV;

const isTest = env === 'test';
const isDev = (env === 'development' || env === 'dev');
const isProd = (env === 'production' || env === 'prod');


module.exports = {
	isDev,
	isTest,
	isProd,
};
