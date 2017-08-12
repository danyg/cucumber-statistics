define(['jquery'], function($){

	if(!window.Promise) {
		function Promise(executor) {
			this._p = $.Deferred(executor).promise();
		}

		Promise.prototype.then = function then() {
			return this._p.then.apply(this._p, arguments);
		};

		Promise.prototype.catch = function() {
			var _p = this._p.fail.apply(this._p, arguments);
			_p.catch = Promise.prototype.catch.bind({_p: _p});
			return _p;
		};

		Promise.all = function all(it) {
			return $.when.apply($, it);
		};

		Promise.race = function all(it) {
			throw new Error('Promise.race pollyfill Implement me');
		};

		Promise.reject = function reject(reason) {
			return $.Deferred(function(resolve, reject) {
				reject(reason);
			}).promise();
		};

		Promise.resolve = function reject(reason) {
			return $.Deferred(function(resolve, reject) {
				resolve(reason);
			}).promise();
		};
	} else {
		var Promise = window.Promise;
		Promise.deferred = function() {
			var resolve, reject,
				promise = new Promise(function(a,b){
					resolve = a,
					reject = b
				})
			;
			return {
				resolve: resolve,
				reject: reject,
				promise: function() { return promise; }
			}
		}
	}


	return Promise;
});