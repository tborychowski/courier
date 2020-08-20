const { series, parallel, src, dest, watch } = require('gulp');
const del = require('del');
const livereload = require('gulp-livereload');

const DIST_PATH = 'public/';
const env = process.env.NODE_ENV;
let isProd = (env === 'production' || env === 'prod');
const setProd = () => isProd = true;


function eslint () {
	const gulpEslint = require('gulp-eslint');
	return src(['client/**/*.js', 'client/**/*.svelte', 'server/**/*.js', '*.js'])
		.pipe(gulpEslint())
		.pipe(gulpEslint.format())
		.pipe(gulpEslint.results(results => {
			if (results.errorCount) console.log('\x07');    // beep
		}));
}


function rollupBuild (inputOptions = {}, outputOptions = {}) {
	const stream = require('stream');
	const rollup = require('rollup');
	const readable = new stream.Readable();

	readable._read = function () { };
	rollup
		.rollup(inputOptions)
		.then(bundle => bundle.generate(outputOptions))
		.then(out => {
			if (!out.code) out = out.output[0];
			readable.push(out.code);
			if (outputOptions.output.sourcemap) {
				readable.push('\n//# sourceMappingURL=');
				readable.push(out.map.toUrl());
			}
			readable.push(null);
		})
		.catch(error => setTimeout(() => readable.emit('error', error)));
	return readable;
}



function js () {
	const commonjs = require('@rollup/plugin-commonjs');
	const source = require('vinyl-source-stream');
	const svelte = require('rollup-plugin-svelte');
	const resolve = require('rollup-plugin-node-resolve');
	const {terser} = require('rollup-plugin-terser');
	const inputOptions = {
		input: './client/index.js',
		plugins: [
			commonjs(),
			resolve({
				extensions: ['.mjs', '.js', '.svelte', '.json'],
				dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
			}),
			svelte({ dev: !isProd, css: false }),
			isProd && terser()
		]
	};
	const outputOptions = {output: {format: 'iife', sourcemap: !isProd}};
	return rollupBuild(inputOptions, outputOptions)
		.pipe(source('index.js'))
		.pipe(dest(DIST_PATH))
		.pipe(livereload());
}


function css () {
	const noop = require('through2').obj;
	const sourcemap = require('gulp-sourcemaps');
	const stylus = require('gulp-stylus');
	const concat = require('gulp-concat');

	return src(['client/**/*.styl'])
		.pipe(isProd ? noop() : sourcemap.init())
		.pipe(stylus({ paths: ['client/ui-style'], compress: isProd, 'include css': true }))
		.pipe(concat('index.css'))
		.pipe(isProd ? noop() : sourcemap.write())
		.pipe(dest(DIST_PATH))
		.pipe(livereload());
}


let serverStarted = false;
function server (done) {
	const nodemon = require('gulp-nodemon');
	nodemon({ script: './server/index.js', watch: ['./server'], ext: 'js html' })
		.on('start', () => {
			if (serverStarted) return;
			serverStarted = true;
			setTimeout(done, 500);
		});
}


function assets () {
	return src(['assets/**/*.*']).pipe(dest(DIST_PATH));
}

function cleanup () {
	return del([DIST_PATH + '/*']);
}

function watchTask (done) {
	if (isProd) return done();
	livereload.listen();
	watch('client/**/*.styl', css);
	watch('client/**/*.{js,svelte}', parallel(eslint, js));
	watch('assets/**/*.*', assets);
}

const build = parallel(eslint, js, css, assets);
exports.build = series(cleanup, build);
exports.server = server;
exports.default = series(build, watchTask);
exports.prod = series(setProd, build);
