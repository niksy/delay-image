var $ = require('jquery');
var Klass = require('kist-klass');
var loadImage = require('kist-loader').loadImage;
var meta = require('./meta');
var instance = require('./instance');
var dom = require('./dom');
var onSuccess = require('./on-success');
var emit = require('kist-toolbox/lib/event-emitter')(meta.name);

/**
 * @class
 */
var Lazyload = module.exports = Klass.extend({

	/**
	 * @param {jQuery} element
	 * @param {Object} options
	 */
	constructor: function ( element, options ) {

		this.element = element;
		this._element = element.toArray(); // Get collection of elements as array of DOM nodes

		this.options = $.extend(true, {}, this.defaults, options);

		instance.setup.call(this);
		dom.setup.call(this);

		this.parse(this.$el).done($.proxy(this._init, this));

	},

	/**
	 * Run on plugin construction
	 *
	 * @param  {jQuery} images
	 */
	_init: function ( images ) {
		onSuccess.call(this, images);
	},

	/**
	 * @param  {jQuery} images
	 *
	 * @return {Promise}
	 */
	parse: function ( images ) {

		emit(this, 'start', [images], dom.$doc);

		/**
		 * Why not load every image with one call to loadImage?
		 *
		 * Since some images can be unreachable, single image which is like
		 * that will result in rejected promise from loadImage which will trigger
		 * every image’s success callback earlier.
		 *
		 * Using it this way we set loadImage for every image and resolve only
		 * one promise for global success, while every image gets to call
		 * it’s success independetly of other images.
		 */

		var arr = [];
		var dfd = $.Deferred();

		images.addClass(this.options.classes.isLoading);

		images.each($.proxy( function ( index, element ) {

			element = $(element);
			arr.push(loadImage(element.data(this.options.srcDataProp)));
			arr[arr.length-1].always($.proxy(this.success, this, element));

		}, this));

		$.when.apply(window, arr).always(function () {
			dfd.resolve(images);
		});

		return dfd.promise();

	},

	/**
	 * @param  {jQuery} image
	 */
	success: function ( image ) {

		image
			.attr({
				src: image.data(this.options.srcDataProp),
				alt: image.data(this.options.altDataProp)
			})
			.removeClass(this.options.classes.isLoading)
			.addClass(this.options.classes.isLoaded);

	},

	destroy: function () {
		dom.destroy.call(this);
		instance.destroy.call(this);
	},

	defaults: {
		success: $.noop,
		start: $.noop,
		srcDataProp: 'src',
		altDataProp: 'alt',
		classes: {
			image: meta.ns.htmlClass + '-image',
			isLoading: 'is-loading',
			isLoaded: 'is-loaded'
		}
	}

});
