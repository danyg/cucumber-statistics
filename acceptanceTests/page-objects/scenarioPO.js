const byScenarioName = (scenarioName) => by.xpath(
	`//*[contains(text(), '${scenarioName}')]/../..`
);
const CONTENTS = by.testClass('contents')
const HANDLER = by.testClass('handler')

const MARK_AS_FIXED_BTN = by.css('.btn-mark-as-fixed');
const MARK_AS_NOT_FIXED_YET_BTN = by.css('.btn-mark-as-not-fixed');
const SHOW_HIDE_BTN = by.css('.btn-show-hide-it');
const ANIM_TIMEOUT = 1000;

class ScenarioItem {
	constructor(scenarioName) {
		this.name = scenarioName;
		this._element = null;
	}

	getElement() {
		if(!this._element) {
			return driver.findElement(byScenarioName(this.name))
				.then(elm => this._element = elm)
			;
		}
		return shared.utilsSO.resolvedPromise(this._element);
	}

	getHandler() {
		return this.getElement()
			.then(elm => elm.findElement(HANDLER))
		;
	}
	getContents() {
		return this.getElement()
			.then(elm => elm.findElement(CONTENTS))
		;
	}

	getName() {
		return this.name;
	}

	expand() {
		return this._openClose(true)
			.then(_ => this.getContents())
			.then(panel => driver.wait(until.elementIsVisible(panel), ANIM_TIMEOUT))
		;
	}

	collapse() {
		return this._openClose(false)
			.then(_ => this.getContents())
			.then(panel => driver.wait(until.elementIsNotVisible(panel), ANIM_TIMEOUT))
		;
	}

	getBtn(btnLabel) {
		var methodName = `get${shared.utilsSO.camelize(btnLabel, true)}Btn`;
		if(!this[methodName]) {
			assert.fail(0,1, `The Scenario object doesn't have any button called "${btnLabel}"| Error methodName: ${methodName} not found!`);
		}
		return this[methodName]();
	}

	getMarkAsFixedBtn() {
		return this.getElement()
			.then(elm => elm.findElement(MARK_AS_FIXED_BTN))
		;
	}

	getMarkAsNotFixedYetBtn() {
		return this.getElement()
			.then(elm => elm.findElement(MARK_AS_NOT_FIXED_YET_BTN))
		;
	}

	getShowHideBtn() {
		return this.getElement()
			.then(elm => elm.findElement(SHOW_HIDE_BTN))
		;
	}

	_openClose(open) {
		let c, w;
		if(open) {
			c = (className) => className.indexOf('expanded') === -1;
			w = 'expanded';
		} else {
			c = (className) => className.indexOf('expanded') === -1;
			w = 'collapsed';
		}

		return this.getElement()
			.then(elm => elm.getAttribute('class'))
			.then(className => {
				if(c(className)) {
					return this.getHandler()
				}
				assert.fail(0,1, `Scenario already ${w}, "${this.name}"`)
			})
			.then(handler => handler.click())
		;
	}
}

module.exports = scenarioPO = {
	cleanScenarios: function () {
		this.scenarios = {};
		this.lastScenario = null;
		this.currentScenario = null;
	},

	getScenario: function (scenarioName) {
		if(!this.scenarios.hasOwnProperty(scenarioName)) {
			this.scenarios[scenarioName] = new ScenarioItem(scenarioName);
		}
		this.currentScenario = this.scenarios[scenarioName];
		return this.currentScenario;
	}
}

scenarioPO.cleanScenarios();
