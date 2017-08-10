const cwd = process.cwd();
const path = require('path');
const acceptanceTestsDir = path.resolve(cwd + '/acceptanceTests')
const {mySpawn} = require('./utils');

// Xvfb :99 & && export DISPLAY=:99
const ENV = JSON.parse(JSON.stringify(process.env))
ENV.DISPLAY=':99';
const df = {
	cwd: acceptanceTestsDir,
	stdio: 'inherit',
	env: ENV
};

function noXvfb(e) {
	console.error('something went wrong', e)
	console.error('')
	console.error('Error initiating Xvfb, is Xvfb installed?')
	console.error('To run this test you need to install Xvfb and firefox')
 	console.error('Try this for Debian/Ubuntu distros:\n\tsudo apt-get install xvfb firefox')
 	console.error('Try this for RedHat/CentOS distros:\n\tsudo yum install Xvfb firefox');
	console.error('')
 	process.exit(-1);
}

const xvfb = mySpawn('Xvfb', [':99'], df);
xvfb.catch(e => noXvfb(e));

if(xvfb.killed) {
	noXvfb();
}

module.exports = function(args) {

	mySpawn(`npm`, ['install'], df)
		.then(_ => mySpawn(`npm`, args, df))
		.then(_ => xvfb.kill())

		.catch(e => {
			if(!!e && !!e.err && e.err !== 1){ // test failed
				console.error('something went wrong', e);
			}
			xvfb.kill();
		});
	;
};
