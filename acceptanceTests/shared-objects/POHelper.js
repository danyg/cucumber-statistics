const {EventEmitter} = require('events');
class POHelper extends EventEmitter{

	onBeforeFeature(cbk) {
		this.on('BeforeFeature', cbk);
	}
	onBeforeScenario(cbk) {
		this.on('BeforeScenario', cbk);
	}
	onAfterScenario(cbk) {
		this.on('BeforeScenario', cbk);
	}
	onAfterFeature(cbk) {
		this.on('AfterFeature', cbk);
	}

	beforeFeature() {
		this.emit('BeforeFeature');
	}
	beforeScenario() {
		this.emit('BeforeScenario');
	}
	afterScenario() {
		this.emit('BeforeScenario');
	}
	afterFeature() {
		this.emit('AfterFeature');
	}

}

module.exports = new POHelper();
