class WordingError extends TypeError {
	constructor(msg, ...args) {
		msg = '[WordingError Error] ' + msg + '';
		super(msg, ...args);
	}
}
global.WordingError = WordingError;

class WordingMethodError extends TypeError {
	constructor(msg, obj, methodName, ...args) {
		msg = `${msg} | ERROR method '${methodName}' not found on ${obj.constructor.name}`;
		super(msg, ...args);
	}
}
global.WordingMethodError = WordingMethodError;

class MissingStep extends TypeError {
	constructor(msg, ...args) {
		msg = `No implementation found for step '${msg}'`;
		super.call(this, msg, ...args);
	}
}

// const buildStepDefinition = requrire('node_modules/cucumber/support_code/step_definition');
// let myStepsDefinitions = [];

// function getFileLine(caller, file,line) {
// 	let err = {};
// 	Error.captureStackTrace(err, caller);
// 	let fileLine = '<unknown>';
// 	let tmp;
// 	try {
// 		fileLine = err.stack.split('\n')[1].trim();
// 		tmp = /[^\()]*\(([^:]+):([\d:]+).*/.exec(fileLine);
// 		file = tmp[1] ? tmp[1] : 'unknown';
// 		line = tmp[2] ? tmp[2] : '?:?';
// 	} catch(e){}
// 	return [file,line];
// }

// module.exports = {
// 	enlarge(cucumber) {
// 		let ds = cucumber.defineStep;
// 		cucumber.defineStep = function defineStep(name, options, code) {
// 			let uri, line;
// 			getFileLine(cucumber.defineStep, uri, line);
// 			myStepsDefinitions.push(buildStepDefinition(name, options, code, uri, line));

// 			return ds.apply(cucumber, arguments);
// 		};

// 		cucumber._ = function(stepName) {
// 			let theStep;
// 			myStepsDefinitions.forEach((item) =>
// 				item.matchesStepName(stepName) ?
// 					theStep = item :
// 					''
// 			);
// 			if(theStep) {
// 				theStep
// 			} else {
// 				throw new MissingStep(stepName)
// 			}
// 		};
// 	}
// };
