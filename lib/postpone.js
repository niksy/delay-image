var $ = require('jquery');
var Lazyload = require('./lazyload');
var onSuccess = require('./on-success');
$.fn.inViewport = require('kist-inviewport');

/**
 * @class
 * @extends {Lazyload}
 */
var Postpone = module.exports = Lazyload.extend({

	_init: $.noop,

	parse: function ( images ) {

		images.inViewport({
			threshold: this.options.threshold,
			debounce: this.options.debounce,
			once: $.proxy(function ( result ) {

				Postpone._super.parse.call(this, result)
					.done($.proxy(onSuccess, this));

			}, this)
		});

		return $.Deferred().resolve().promise();

	},

	destroy: function () {
		Postpone._super.destroy.call(this);
		this.$el.inViewport('destroy');
	},

	defaults: $.extend(true, {}, Lazyload.prototype.defaults, {
		threshold: 0,
		debounce: 300
	})

});
