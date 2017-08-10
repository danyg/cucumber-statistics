module.exports = function() {


	// ┌───────────────────────────────────────────────────────────────────────┐
	// │                    ██████  █                                          │
	// │                   █           █   █   ███   █ ██                      │
	// │                   █  ███   █  █   █  █   █  ██  █                     │
	// │                   █     █  █   █ █   ████   █   █                     │
	// │                   █     █  █   █ █   █      █   █                     │
	// │                    █████   █    █     ████  █   █                     │
	// └───────────────────────────────────────────────────────────────────────┘

	this.Given(/there (are|is) "([^"]+)" scenarios? that has been "([^"]+)"/, (_, amount, optionName) => {
		amount = parseInt(amount, 10);
		let totalAmount = parseInt(amount + '', 10);
		shared.scenarioStore.givenHiddenScenarios = totalAmount;

		let recursiveHideScenario = () => page.scenarioPO.getAmountOfScenariosDisplayed()
			.then(scnDisplayed => expect(scnDisplayed)
				.to.be.at.least(
					amount,
					`there aren\'t enough scenarios displayed to been "${optionName}"`
				)
			)
			.then(_ => page.scenarioPO.getScenarioNth(1))
			.then(scn => {
				return scn.expand()
					.then(_ => scn.getBtn(optionName))
					.then(btn => btn.click())
			})
			.then(_ => (--amount) > 0 ? recursiveHideScenario() : true)
		;
		return recursiveHideScenario();
	});

	// ┌───────────────────────────────────────────────────────────────────────┐
	// │                   █       █  █                                        │
	// │                   █   █   █  █ ██    ███   █ ██                       │
	// │                    █ █ █ █   ██  █  █   █  ██  █                      │
	// │                    █ █ █ █   █   █  ████   █   █                      │
	// │                     █   █    █   █  █      █   █                      │
	// │                     █   █    █   █   ████  █   █                      │
	// └───────────────────────────────────────────────────────────────────────┘

	this.When(/the user expands the "([^"]+)" scenario/, (scenarioName) => {
		return page.scenarioPO.getScenario(scenarioName)
			.then(scn => scn.expand())
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	this.When(/the user colapses the "([^"]+)" scenario/, (scenarioName) => {
		return page.scenarioPO.getScenario(scenarioName)
			.then(scn => scn.collapse())
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	this.When(/^the user "([^"]+)" the scenario$/, (optionName) => {
		let scn = page.scenarioPO.currentScenario;

		let promise = shared.utilsSO.resolvedPromise();
		if(optionName === 'Mark as Fixed') {
			promise = page.lastExecutionsPO.getShowHiddenScenariosCount()
				.then(count => shared.scenarioStore.lastExecutionsHiddenScenarios = count)
			;
		}

		return promise
			.then(_ => scn.getBtn(optionName))
			.then(btn => btn.click())
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});


	this.When(/^expand a scenario that was previously "([^"]+)"$/, (optionName) => {
		return page.scenarioPO.getFirstScenario(optionName)
			.then(scn => scn.expand())
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	// ┌───────────────────────────────────────────────────────────────────────┐
	// │                    ███████  █                                         │
	// │                       █     █ ██    ███   █ ██                        │
	// │                       █     ██  █  █   █  ██  █                       │
	// │                       █     █   █  ████   █   █                       │
	// │                       █     █   █  █      █   █                       │
	// │                       █     █   █   ████  █   █                       │
	// └───────────────────────────────────────────────────────────────────────┘

	this.Then(/^the user is presented with the option to "([^"]+)" the scenario$/, (optionName) => {
		return page.scenarioPO.currentScenario.getBtn(optionName)
			.then(btn => btn.getText())
			.then(text => assert.equal(
				text,
				optionName,
				"Button has not the expected label"
			))
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	this.Then(/^the scenario (?:gets|remains) hidden$/, () => {
		let scn = page.scenarioPO.currentScenario;

		return scn.getElement()
			.then(elm => elm.isDisplayed())
			.then(v => assert.isFalse(v, `Scenario "${scn.getName()}" should be hidden.`))
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	let scenarioIsVisible = () => {
		let scn = page.scenarioPO.currentScenario;

		return scn.getElement()
			.then(elm => elm.isDisplayed())
			.then(v => assert.isTrue(v, `Scenario "${scn.getName()}" should be visible.`))
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	};
	this.Then(/^the scenario is shown$/, scenarioIsVisible);

	let checkScenarioFaded = (scn) => {
		return scn.isVisible()
			.then(v => expect(v, 'Scenario should be show').to.be.true)
			.then(_ => scn.getElement())
			.then(e => e.getCssValue('opacity'))
			.then(opacity => expect(opacity).to.be.below(1))
		;
	};
	this.Then(/^the hidden scenarios are displayed in a faded way indicating it is hidden$/, function () {
		return page.scenarioPO.getCurrentScenario()
			.then(scn => checkScenarioFaded(scn))
			.then(_ => {
				if(shared.scenarioStore.givenHiddenScenarios > 1) {
					return page.scenarioPO.getLastScenario()
						.then(scn => checkScenarioFaded(scn))
				}
				return;
			})
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	this.Then(/^the scenario is shown in a faded way indicating it is hidden$/, () => {
		let scn = page.scenarioPO.currentScenario;
		return scenarioIsVisible()
			.then(_ => checkScenarioFaded(scn))
		;
	});

	this.Then(/^the counter of hidden scenarios gets increased$/, () => {
		return page.lastExecutionsPO.getShowHiddenScenariosCount()
			.then(currentCount => {
				expect(currentCount)
					.to.be
					.above(
						shared.scenarioStore.lastExecutionsHiddenScenarios,
						'current count should be above the initial counter'
					)
			})
			.then(_ => shared.utilsSO.takeScreenshot())

		;
	});

	this.Then(/^the scenario is visible( again)$/, (_) => {
		return page.scenarioPO.getCurrentScenario()
			.then(scn => {
				return scn.isMarkedAsFixed()
					.then(mAF => expect(mAF, 'Scenario should not be Marked as Fixed').to.be.false)
					.then(_ => scn.isLocallyHidden())
					.then(iLH => expect(iLH, 'Scenario should not be locally hidden').to.be.false)
					.then(_ => page.lastExecutionsPO.storeHiddenScenarioStatus())
					.then(_ => page.lastExecutionsPO.hideHiddenScenarios())
					.then(_ => scn.isVisible())
					.then(iV => expect(iV, 'Scenario should be visible when the hidden scenarios are not shown').to.be.true)
					.then(_ => page.lastExecutionsPO.restoreHiddenScenarioStatus())
			})
		;
	});

};
