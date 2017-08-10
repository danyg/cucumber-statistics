const byScenarioName = (scenarioName) => {
	return by.testId('scenario_' + shared.utilsSO.camelize(scenarioName));
}
const byScenarioNth = (nth) => by.css(
	`.scenarios-container li:nth-child(${nth}) div.item.scenario`
);
const CONTENTS = by.testClass('contents')
const HANDLER = by.testClass('handler')

const SCENARIO = by.css(`.scenarios-container div.item.scenario`);
const MARK_AS_FIXED_BTN = by.css('.btn-mark-as-fixed');
const MARK_AS_NOT_FIXED_YET_BTN = by.css('.btn-mark-as-not-fixed');
const MARKED_AS_FIXED = by.css('.item.scenario.marked-as-fix');
const MARKED_AS_LOCALLY_HIDDEN = by.css('.item.scenario.is-locally-hidden');
const TITLE_ELM_IN_CTN = by.css('.title .name');

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
		let methodName = `get${shared.utilsSO.camelize(btnLabel, true)}Btn`;
		if(!this[methodName]) {
			throw new WordingMethodError(`The Scenario object doesn't have any button called "${btnLabel}"`, this, methodName);
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

	getLocallyHiddenBtn() {
		return this.getShowHideBtn();
	}

	getShowBtn() {
		return this.getShowHideBtn();
	}

	getShowHideBtn() {
		return this.getElement()
			.then(elm => elm.findElement(SHOW_HIDE_BTN))
		;
	}

	getHideBtn() {
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

	isMarkedAsFixed() {
		return this.getElement()
			.then(elm => elm.getAttribute('class'))
			.then(className => className.indexOf('mark-as-fixed') !== -1)
		;
	}

	isLocallyHidden() {
		return this.getElement()
			.then(elm => elm.getAttribute('class'))
			.then(className => className.indexOf('is-locally-hidden') !== -1)
		;
	}

	isVisible() {
		return this.getElement()
			.then(e => e.isDisplayed())
		;
	}

	isExpanded() {
		return this.getContents()
			.then(c => c.isDisplayed())
		;
	}
}

class ScenarioPO {
	constructor() {
		this.cleanScenarios();
	}

	cleanScenarios() {
		this.scenarios = {};
		this.lastScenario = null;
		this.currentScenario = null;
	}

	getCurrentScenario() {
		return shared.utilsSO.resolvedPromise(this.currentScenario);
	}

	getLastScenario() {
		return shared.utilsSO.resolvedPromise(this.lastScenario);
	}

	getScenario(scenarioName) {
		if(!this.scenarios.hasOwnProperty(scenarioName)) {
			this.scenarios[scenarioName] = new ScenarioItem(scenarioName);
		}
		this.currentScenario = this.scenarios[scenarioName];
		return this.getCurrentScenario();
	}

	getAmountOfScenariosDisplayed() {
		return driver.findElements(SCENARIO)
			.then(elms => elms.length)
		;
	}

	getScenarioNth(nth) {
		return driver.findElement(byScenarioNth(nth))
			.then(ctn => this.getScenarioByScenarioContainer(ctn))
		;
	}

	/**
	 * @param  {String} [scenarioType] if not defined, will return actual first Scenario in the list
	 * @return {Promise<ScenarioItem>}
	 */
	getFirstScenario(scenarioType) {
		if(!scenarioType) {
			return this.getScenarioNth(1);
		}
		let methodName = `getFirst${shared.utilsSO.camelize(scenarioType, true)}Scenario`;
		if(!this[methodName]) {
			throw new WordingMethodError(`There aren't scenarios "${scenarioType}"`, this, methodName);
		}
		return this[methodName]();
	}

	getFirstMarkAsFixedScenario() {
		return driver.findElement(MARKED_AS_FIXED)
			.then(ctn => this.getScenarioByScenarioContainer(ctn))
		;
	}

	getFirstLocallyHiddenScenario() {
		return driver.findElement(MARKED_AS_LOCALLY_HIDDEN)
			.then(ctn => this.getScenarioByScenarioContainer(ctn))
		;
	}

	getScenarioByScenarioContainer(ctn) {

		return ctn.findElement(TITLE_ELM_IN_CTN)
			.then(titleElm => titleElm.getText())
			.then(title => this.getScenario(title))
		;
	}
}

module.exports = new ScenarioPO();
