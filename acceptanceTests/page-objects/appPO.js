const {startTestServer, TEST_PORT, closeTestServer} = require('../testServer');

class AppPO {
	constructor() {
		this.url = `http://localhost:${TEST_PORT}/`;
		this.elements = {
			initialSpinner: By.testId('initial_spinner'),
			mainLoadingSpinner: By.testId('mainLoading_spinner')
		};
		this.currentApp = null;
		shared.utilsSO.onShutdown(this.closeApp.bind(this));

		this.closePreviousServer();
	}

	_printAppInitMarkers() {
		console.log('\n\n\n────────────────────────────────────────────────────────────────────────────────\n');
	}

	_printAppEndInitMarkers() {
		console.log('\n────────────────────────────────────────────────────────────────────────────────\n\n\n');
	}

	startApp() {
		this._printAppInitMarkers();
		return startTestServer()
			.then(app => {
				this.currentApp = app;
				this._printAppEndInitMarkers();
				return true;
			})
		;
	}

	closePreviousServer() {
		LOGGER.info(`Shuting down server in port ${TEST_PORT}`)
		shared.restHttpSO.get(`/admin/shutdown`)
	}

	closeApp() {
		return this.currentApp ?
			closeTestServer(this.currentApp) :
			true
		;
	}

	open() {
		return helpers.loadPage(this.url)
			.then(_ => this.waitForInitialSpinner())
			.then(_ => this.waitForMainSpinnerToDissapear())
		;
	}

	getContainer(containerTitle) {
		var testId = shared.utilsSO.camelize(containerTitle) + '_container';
		return driver.findElement(By.testId(testId))
			.catch(
				_ => assert.fail(testId,'', `Container "${containerTitle}" with testId ${testId} not found!`)
			)
		;
	}

	getContainerTitleText(containerTitle) {
		var testId = shared.utilsSO.camelize(containerTitle) + '_containerTitle';
		return driver.findElement(By.testId(testId))
			.then(elm => {
				return elm.getText();
			})
			.catch(
				_ => assert.fail(testId,'', `Title Element for "${containerTitle}" with testId ${testId} not found!`)
			)
		;
	}

	waitForInitialSpinner() {
		return driver.wait(
				until.elementLocated(this.elements.initialSpinner)
			)
			.then(spinner => {
				spinner.isDisplayed().then(v => assert.isTrue(v, 'The spinner should be displayed.'));
				driver.wait(until.stalenessOf(spinner))
			})
		;
	}

	waitForMainSpinner() {
		return driver.wait(
				until.elementLocated( this.elements.mainLoadingSpinner )
			)
			.then(_ => this.waitForMainSpinnerToDissapear())
		;
		/*
		spinner => {
				spinner.isDisplayed().then(v => assert.isTrue(v, 'The spinner should be displayed.'));
				driver.wait(until.elementIsNotVisible(spinner))
			}
		 */
	}

	waitForMainSpinnerToDissapear() {
		return driver.findElements(this.elements.mainLoadingSpinner)
			.then(elms => {
				if(elms.length === 0) {
					return true;
				}

				return new Promise((a,b) => {
					try {
						driver.wait(until.elementIsNotVisible(elms[0]))
							.then(_ => a(_))
							.catch(_ => a(_))
						;
					} catch(e) {
						a(_);
					}
				});
			})
		;
	}
}

module.exports = new AppPO();
