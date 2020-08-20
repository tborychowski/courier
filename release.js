#!/usr/bin/env node

const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const ora = require('ora');
const chalk = require('chalk');
const indent = require('detect-indent');
const inquirer = require('inquirer');
const git = require('simple-git')();
const cwd = process.cwd();

const APP = {};
const manifests = [ 'package.json' ];
const dryrun = false;
const faker = arg => new Promise(resolve => setTimeout(() => resolve(arg), 2000));

function run (cmd) {
	if (dryrun) return faker();
	return new Promise((resolve, reject) => {
		exec(cmd, (err, out) => (err ? reject(err) : resolve(out)));
	});
}


function getVersion (manifest) {
	const pkgPath = path.join(cwd, manifest || manifests[0]);
	const pkg = require(pkgPath);
	const current = pkg.version || '0.0.0';
	return {
		name: pkg.name,
		current: current,
		nextMajor: semver.inc(current, 'major'),
		nextMinor: semver.inc(current, 'minor'),
		nextPatch: semver.inc(current, 'patch')
	};
}


function bump (manifest, newVersion) {
	const pkgPath = path.join(cwd, manifest);
	const pkg = require(pkgPath);
	const usedIndent = indent(fs.readFileSync(pkgPath, 'utf8')).indent || '  ';
	pkg.version = newVersion;
	if (!dryrun) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, usedIndent) + '\n');
}


function commit (version) {
	if (dryrun) return faker();
	return new Promise((resolve, reject) => {
		git
			.silent(true)
			.add('./*')
			.commit('Release v' + version)
			.push(['origin', 'master'], err => {
				if (err) reject(err);
				else resolve({version});
			});
	});
}

function release () {
	const app = getVersion();
	APP.name = app.name;
	let spinner;
	console.log('\n********************************');
	console.log('*                              *');
	console.log(`*      Releasing ${chalk.cyan(APP.name)}        *`);
	console.log('*                              *');
	console.log('********************************\n');
	inquirer
		.prompt([
			{
				type: 'list',
				name: 'version',
				message: 'Bump version to:',
				default: 1,
				choices: [
					{ value: app.current,   name: 'current (' + app.current + ')' },
					{ value: app.nextPatch, name: 'patch   (' + app.nextPatch + ')' },
					{ value: app.nextMinor, name: 'minor   (' + app.nextMinor + ')' },
					{ value: app.nextMajor, name: 'major   (' + app.nextMajor + ')' },
					new inquirer.Separator(),
					{ value: 'custom', name: 'custom...' },
				]
			},
			{
				type: 'input',
				name: 'version',
				message: 'Enter the new version number:',
				default: app.current,
				when: answers => answers.version === 'custom',
				filter: semver.clean,
				validate: answer => semver.valid(answer) ? true : 'That\'s not a valid version number',
			}
		])
		.then(({version}) => {
			APP.version = version;
			spinner = ora('').start();
			// update package & manifest
			manifests.forEach(m => {
				spinner.text = `Updating ${m}...`;
				bump(m, version);
				spinner.text = `Updated ${chalk.cyan(m)} to ${chalk.cyan(version)}`;
				spinner.succeed();
			});
			spinner.text = 'Committing to GitHub...';
			spinner.start();
			return commit(version);              // commit code changes to  github
		})
		.then(() => {
			spinner.text = `Update ${chalk.cyan('pushed')} to Github.`;
			spinner.succeed();

			spinner.text = 'Building a docker image...';
			spinner.start();
			const tagLatest = `tborychowski/${APP.name}:latest`;
			const tagVersion = `tborychowski/${APP.name}:${APP.version}`;
			return run(`docker build --no-cache -t ${tagLatest} -t ${tagVersion} .`);
		})
		.then(() => {
			spinner.text = 'Built a ' + chalk.cyan('docker image');
			spinner.succeed();

			spinner.text = 'Pushing images to the docker hub...';
			spinner.start();

			const cmd = `docker push tborychowski/${APP.name}:latest && ` +
				`docker push tborychowski/${APP.name}:${APP.version}`;
			return run(cmd).catch(() => {});
		})
		.then(() => {
			spinner.text = 'Images pushed to ' + chalk.cyan('docker hub');
			spinner.succeed();
			console.log(chalk.cyan('All done!'));
			process.exit(0);
		})
		.catch(e => {
			spinner.text = e;
			spinner.fail();
		});
}


release();
