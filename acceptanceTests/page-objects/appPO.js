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
		LOGGER.debug(`Shuting down server in port ${TEST_PORT}`)
		return shared.restHttpSO.get(`/admin/shutdown`)
			.then(_ => shared.utilsSO.waits(500))
		;
	}

	closeApp() {
		LOGGER.debug(`Closing Test Cucumber Statistics App...`);
		return Promise.resolve(!!this.currentApp)
			.then(c => c ? closeTestServer(this.currentApp) : true)
			.then(_ => LOGGER.debug('Test Cucumber Statistics App Closed.'))
		;
	}

	open() {
		LOGGER.debug(`Opening Browser at ${this.url}...`);
		return helpers.loadPage(this.url)
			.then(_ => LOGGER.debug(`Browser at ${this.url}, Waiting for Spinners...`))
			.then(_ => this.waitForInitialSpinner())
			.then(_ => LOGGER.debug(`Initial Spinner dissapeared, Waiting for main page to be rendered.`))
			.then(_ => this.waitForMainSpinnerToDissapear())
			.then(_ => LOGGER.debug(`Main Page ready to be used.`))
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
		return this.waitForMainSpinnerToDissapear();
	}

	waitForMainSpinnerToDissapear() {
		LOGGER.debug('Waiting for Main Spinner to be invisible.');
		let retry = 1;
		let waitForMainSpinner = (r) => {
			retry += r;
			return driver.wait(
					until.elementLocated( this.elements.mainLoadingSpinner )
				)
				.then(elm => {
					LOGGER.debug(`Waiting for Main Loading Spinner Attempt No:${retry}`);
					if(!elm) {
						LOGGER.warn('Main Loading Spinner not found?');
						return shared.utilsSO.waits(500)
							.then(_ => waitForMainSpinner(1))
						;
					}

					return new Promise((a,b) => {
						try {
							driver.wait(until.elementIsNotVisible(elm))
								.then(_ => a(true))
								.catch(_ => a(false))
							;
						} catch(e) {
							a(false);
						}
					});
				})
			;
		};

		return waitForMainSpinner(0)
			.then(r => !r ? waitForMainSpinner(1) : true)
		;
	}
}

module.exports = new AppPO();
