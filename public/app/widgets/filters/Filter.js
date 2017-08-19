define([
	'knockout'
], function(
	ko
){

	var ACTION_ADD = '+';
	var ACTION_RMV = '-';
	var TAG_ROOT = '__ROOT__';

	function Filter(tag, action) {
		this.filters = ko.observableArray([]);
		this.filters.subscribe(this._onFiltersPush.bind(this));
		this.action = ko.observable(undefined);

		if(tag instanceof Filter) {
			this._onFiltersPush(tag);
		} if(tag instanceof Array) {

			tag.forEach((function(itm){
				this.add(itm);
			}).bind(this));

		} else {

			this.tag = tag;
			if(this.tag !== TAG_ROOT) {
				switch(action) {
					case ACTION_ADD:
					case ACTION_RMV:
						this.action(action);
					break;
					default:
						throw TypeError('action not recognised ' + action)
				}

				this.add(this);
			}

		}
	}

	Filter.prototype.toString = function() {
		return this.action() + '|' + this.tag;
	}

	Filter.prototype._onFiltersPush = function() {
		this.filters().forEach((function(itm){
			if(itm !== this) {
				if(itm.tag === undefined && undefined === itm.action() && itm.filters().length === 1) {
					this.filters.remove(itm);
				}
				if(this.tag !== TAG_ROOT && itm.filters().length > 1) {
					itm.filters.splice(0, itm.filters().length)
						.forEach((function(flt){
							this.add(flt);
						}).bind(this))
					;
					itm.add(itm);
				}
			}
		}).bind(this));

	};

	Filter.prototype.add = function(filter) {
		if(filter instanceof Filter) {
			filter.parent = this;
			this.filters.push(filter)
			return this;
		}

		throw new TypeError('the received filter is not an instance of Filter');
	};

	Filter.prototype.toggleAction = function() {
		this.action( this.action() === ACTION_ADD ? ACTION_RMV : ACTION_ADD );
		this.parent.filters.valueHasMutated();
	}

	Filter.prototype.getInLength = function() {
		return 5000;
	};

	Filter.prototype.getOutLength = function() {
		return 10;
	};





	Filter.ROOT = new Filter(TAG_ROOT);

	Filter.ACTION_ADD = ACTION_ADD;
	Filter.ACTION_RMV = ACTION_RMV;
	Filter.TAG_ROOT = TAG_ROOT;
	Filter.prototype.ACTION_ADD = ACTION_ADD;
	Filter.prototype.ACTION_RMV = ACTION_RMV;
	Filter.prototype.TAG_ROOT = TAG_ROOT;
	Filter.prototype.ROOT = Filter.ROOT;

	return Filter;
});