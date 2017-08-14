define([
	'jquery'
], function(
	$
) {
	return {

		disposeSubscriptions: function(subscriptions) {
			subscriptions.forEach(function(sub){
				if(sub.dispose) {
					sub.dispose();
				}
				if(sub.off) {
					sub.off();
				}
			});
		},

		bindObservables: function(observA, observB) {
			var itsMe,
				subs = [
					observA.subscribe((function(){
						if(!itsMe) {
							itsMe = true;
							observB(observA());
							itsMe = false;
						}
					}).bind(this)),
					observB.subscribe((function(){
						if(!itsMe) {
							itsMe = true;
							observA(observB());
							itsMe = false;
						}
					}).bind(this))
				]
			;

			observA(observB());

			return {
				dispose: (function() {
					this.disposeSubscriptions(subs);
				}).bind(this)
			};
		},

		bytes: function bytes(v) {
			v = parseFloat(v);
			var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
			var c = 1024.0, r, i=0;
			while(v >= c) {
				v = v / c;
				i++;
			}
			return (i === 0 ? v.toString() : v.toFixed(2)) + ' ' + units[i];
		},

		calculateDateDiff: function(a, b, withMs) {
			a = a instanceof Date ? a.getTime() : a;
			b = b instanceof Date ? b.getTime() : b;
			var sign = 1;
			var diff = 0;

			if(a > b) {
				diff = a - b;
				sign = -1
			} else if(a < b) {
				diff = b - a;
			} else {
				diff = 0;
			}

			return this.msToHuman(diff, sign, withMs)
		},

		msToHuman: function(ms, sign, withMs) {
			sign = undefined === sign ?
				(ms < 0 ? -1 : 1):
				sign
			;
			var d = new Date();
			d.setTime(Math.abs(ms));

			var dPartsSym = ['Y', 'M', 'D', 'h', 'm', 's'];
			if(withMs) {
				dPartsSym.push('ms')
			}
			var dParts = [
				(d.getUTCFullYear()-1970),
				d.getUTCMonth(),
				(d.getUTCDate()-1),
				d.getUTCHours(),
				d.getUTCMinutes(),
				d.getUTCSeconds(),
				d.getUTCMilliseconds()
			];

			var str = dPartsSym.map(function(symbol, ix) {
				return dParts[ix] > 0 ? dParts[ix]+symbol : ''
			}).join(' ').trim();
			if(str === ''){
				str = '0' + (withMs ? 'm':'') + 's';
			}

			return str + (sign < 0 ? ' ago' : '');
		},

		cucumberTimeToHuman: function(time) {
			var time = parseFloat(time) / 1000000.0;
			return this.msToHuman(time, null, true);
		}

	};
});