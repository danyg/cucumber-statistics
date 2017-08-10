const fs = require('fs');
let loremIpsum = fs.readFileSync(__dirname + '/loremIpsum.txt')
	.toString()
	.replace(/\r/g, '')
	.split('\n')
;
const features = loremIpsum.splice(0, 5);
const givens = loremIpsum.splice(0, 25);
const whens = loremIpsum.splice(0, 25);
const thens = loremIpsum.splice(0, 25);

const tags = [
	'@LoremIpsum',
	'@DolorAnet',
	'@Pellentesque',
	'@Quisque',
	'@Vivamus'
];

function toId(str) {
	return str
		.toLowerCase()
		.replace(/[\W\s]/g, '-')
		.replace(/--/g, '-')
	;
}

let line = 0;
let fIx = -1;
let lastFeature = '';
function feature() {
	fIx++;
	if(features.length <= fIx) {fIx = 0;}
	let iX = fIx;

	line = 0;
	return {
		elements: [],
		id: lastFeature = toId(features[iX]),
		line: ++line,
		name: features[iX],
		tags: [ tags[0] ],
		uri: `/project/features/${lastFeature}.feature`
	};
}

sIx = -1;
function scenario(gS, wS, tS) {
	sIx++;
	if(loremIpsum.length <= sIx) {sIx = 0;}
	let iX = sIx;
	line++; // space between scenarios!

	if(gS === 'failed') {
		wS = 'skipped';
		tS = 'skipped';
	}
	if(wS === 'failed') {
		tS = 'skipped';
	}

	return {
		id: lastFeature + ';' + toId(loremIpsum[iX]),
		keyword: "Scenario",
		line: ++line,
		name: loremIpsum[iX],
		steps: [
			given(gS),
			when(wS),
			then(tS)
		],
		tags: [getTag()],
		type: 'scenario'
	}
}

tgIx = 0; // ix 0 is vanished
function getTag() {
	tgIx++;
	if(tags.length <= tgIx) {tgIx = 1;} // ix 0 is vanished
	let iX = tgIx;
	return tags[iX];
}

let gIx = -1;
function given(status) {
	gIx++;
	if(givens.length <= gIx) {gIx = 0;}
	let iX = gIx;

	return {
		arguments: [],
		keyword: 'Given ',
		name: givens[iX],
		result: {
			status: status,
			duration: 2093894605
		},
		line: ++line,
		match: {
			location: `/project/step-definitions/givens.js:${iX*10}`
		}
	};
}

let wIx = -1;
function when(status) {
	wIx++;
	if(whens.length <= wIx) {wIx = 0;}
	let iX = wIx;

	return {
		arguments: [],
		keyword: 'When ',
		name: whens[iX],
		result: {
			status: status,
			duration: 2093894605
		},
		line: ++line,
		match: {
			location: `/project/step-definitions/whens.js:${iX*10}`
		}
	};
}

let tIx = -1;
function then(status) {
	tIx++;
	if(thens.length <= tIx) {tIx = 0;}
	let iX = tIx;

	return {
		arguments: [],
		keyword: 'Then ',
		name: thens[iX],
		result: getResult(status),
		line: ++line,
		match: {
			location: `/project/step-definitions/thens.js:${iX*10}`
		}
	};
}

function getResult(status) {
	let r = {
		status: status,
		duration: 2093894605
	};
	if(status === 'failed') {
		r.error_message = "NoSuchElementError: {\"errorMessage\":\"Unable to find element with xpath '//*[contains(text(), 'A user can Mark a scenario as fixed, this will hide the scenario from the view')]/../..'\",\"request\":{\"headers\":{\"Accept\":\"application/json; charset=utf-8\",\"Connection\":\"close\",\"Content-Length\":\"137\",\"Content-Type\":\"application/json;charset=UTF-8\",\"Host\":\"192.168.238.128:48857\"},\"httpVersion\":\"1.1\",\"method\":\"POST\",\"post\":\"{\\\"using\\\":\\\"xpath\\\",\\\"value\\\":\\\"//*[contains(text(), 'A user can Mark a scenario as fixed, this will hide the scenario from the view')]/../..\\\"}\",\"url\":\"/element\",\"urlParsed\":{\"anchor\":\"\",\"query\":\"\",\"file\":\"element\",\"directory\":\"/\",\"path\":\"/element\",\"relative\":\"/element\",\"port\":\"\",\"host\":\"\",\"password\":\"\",\"user\":\"\",\"userInfo\":\"\",\"authority\":\"\",\"protocol\":\"\",\"source\":\"/element\",\"queryKey\":{},\"chunks\":[\"element\"]},\"urlOriginal\":\"/session/e364b290-762e-11e7-b22b-b36dba60d5c4/element\"}}\n    at WebDriverError (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/node_modules/selenium-webdriver/lib/error.js:27:5)\n    at NoSuchElementError (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/node_modules/selenium-webdriver/lib/error.js:168:5)\n    at Object.checkLegacyResponse (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/node_modules/selenium-webdriver/lib/error.js:505:15)\n    at parseHttpResponse (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/node_modules/selenium-webdriver/lib/http.js:440:13)\n    at process._tickCallback (internal/process/next_tick.js:109:7)\nFrom: Task: WebDriver.findElement(By(xpath, //*[contains(text(), 'A user can Mark a scenario as fixed, this will hide the scenario from the view')]/../..))\n    at thenableWebDriverProxy.schedule (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/node_modules/selenium-webdriver/lib/webdriver.js:815:17)\n    at thenableWebDriverProxy.findElement (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/node_modules/selenium-webdriver/lib/webdriver.js:1016:17)\n    at ScenarioItem.getElement (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/page-objects/scenarioPO.js:17:18)\n    at ScenarioItem._openClose (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/page-objects/scenarioPO.js:72:15)\n    at ScenarioItem.expand (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/page-objects/scenarioPO.js:29:15)\n    at World.When (/home/daniel/DEVEL/cucumberStatistics/cucumber-statistics/acceptanceTests/step-definitions/scenario-steps.js:5:5)\n    at _combinedTickCallback (internal/process/next_tick.js:73:7)\n    at process._tickCallback (internal/process/next_tick.js:104:9)"
	}
	return r;
}

let seed=0;
function getStatus() {
	seed++;
	// console.log( seed, ' ==> ', parseInt(Math.sin(seed).toFixed(8)*10) , ' ==> ', parseInt(Math.sin(seed).toFixed(8)*10) > 0 ? 'passed' : 'failed')
	return parseInt(Math.sin(seed).toFixed(8)*10) > 0 ? 'passed' : 'failed';
}

function resetCounters() {
	fIx = -1;
	sIx = -1;
	tgIx = 0;
	gIx = -1;
	wIx = -1;
	tIx = -1;
}


function generateNightly(s) {
	resetCounters();

	if(undefined === s) {
		s = 0;
	}
	seed = s;
	// console.log('WITH SEED:', s);
	var scenariosByFeature = (Math.PI*1000000000000000).toString().split('');
	var report = [];
	features.forEach((_, ix) => {
		let f = feature();
		let nScenarios = parseInt(scenariosByFeature[ix], 10);

		for(let i=0; i < nScenarios; i++) {
			f.elements.push(scenario(
				getStatus(),
				getStatus(),
				getStatus()
			));
		}

		report.push(f);
	});

	return JSON.stringify(report, null, '  ');
}

module.exports = generateNightly;
if (require.main === module) {
	let s = 0;
	if( !isNaN( parseInt(process.argv[1], 10) ) ) {
		s = parseInt(process.argv[1], 10)
	} else if( !isNaN( parseInt(process.argv[2], 10) ) ) {
		s = parseInt(process.argv[2], 10)
	}

	process.stdout.write( generateNightly(s) );
}