define([], function() {
	return {

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
		}

	};
});