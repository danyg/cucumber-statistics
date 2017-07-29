const {startTestServer, TEST_PORT} = require('../testServer');

class AppPO {
	constructor() {
		this.url = `http://localhost:${TEST_PORT}/`;
		this.elements = {
			initialSpinner: By.testId('initial_spinner'),
			mainLoadingSpinner: By.testId('mainLoading_spinner')
		};
		this.currentApp = null;
	}

	_printAppInitMarkers() {
		console.log('\n\n\n────────────────────────────────────────────────────────────────────────────────\n');
	}

	_printAppEndInitMarkers() {
		console.log('\n────────────────────────────────────────────────────────────────────────────────\n\n\n');
	}

	startApp() {
		this._printAppInitMarkers();
		console.log('Wiping Testing DB...');

		return startTestServer()
			.then(app => {
				this.currentApp = app;
				this._printAppEndInitMarkers();
				return true;
			})
		;
	}

	closeApp() {
		return new Promise((resolve) => {
			(this.currentApp) ? this.currentApp.close() : '';
			setTimeout(resolve, 1000);
		});
	}

	open() {
		return helpers.loadPage(this.url)
			.then(_ => this.waitForInitialSpinner())
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
				until.elementLocated(this.elements.mainLoadingSpinner)
			)
			.then(spinner => {
				spinner.isDisplayed().then(v => assert.isTrue(v, 'The spinner should be displayed.'));
				driver.wait(until.stalenessOf(spinner))
			})
		;
	}
}

module.exports = new AppPO();
