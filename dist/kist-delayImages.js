/*! kist-delayImages 0.3.4 - Delay images via postpone or lazyload. | Author: Ivan Nikolić, 2014 | License: MIT */
;(function ( $, window, document, undefined ) {

	var plugin = {
		name: 'delayImages',
		ns: {
			css: 'kist-DelayImages',
			event: '.kist.delayImages'
		},
		error: function ( message ) {
			throw new Error(plugin.name + ': ' + message);
		}
	};
	plugin.classes = {
		image: plugin.ns.css + '-image',
		isLoading: 'is-loading',
		isLoaded: 'is-loaded'
	};
	plugin.publicMethods = ['destroy'];

	var dom = {
		setup: function () {
			this.dom    = this.dom || {};
			this.dom.el = $(this.element);

			// Get collection of elements as array of DOM nodes
			this._element = this.dom.el.toArray();

			this.dom.el.addClass(plugin.classes.image);
		},
		destroy: function () {
			$.each(plugin.classes, $.proxy(function ( prop, val ) {
				this.dom.el.removeClass(val);
			}, this));
		}
	};

	var instance = {
		id: 0,
		setup: function () {
			this.instance     = this.instance || {};
			this.instance.id  = instance.id++;
			this.instance.ens = plugin.ns.event + '.' + this.instance.id;
		},
		destroy: function () {
			this.dom.el.each(function ( index, element ) {
				delete $.data(element)[plugin.name];
			});
		}
	};

	var aux = {
		setup: function () {
			this.aux = this.aux || {};
			this.aux.loadImage = $.kist.loader.loadImage;
			// $.fn.inView
		}
	};

	/**
	 * @param  {Mixed} options
	 *
	 * @return {Object}
	 */
	function constructOptions ( options ) {
		return typeof(options) === 'object' ? options : {};
	}

	/**
	 * @param  {String} options
	 *
	 * @return {Function}
	 */
	function constructMethod ( options ) {
		return options.method === 'postpone' ? Postpone : Lazyload;
	}

	/**
	 * @class
	 *
	 * @param {jQuery} element
	 * @param {Object} options
	 */
	function Lazyload ( element, options ) {

		this.element = element;
		this.options = $.extend({}, this.defaults, options);

		instance.setup.call(this);
		aux.setup.call(this);
		dom.setup.call(this);

		this.parse(this.dom.el);

	}

	$.extend(Lazyload.prototype, {

		/**
		 * @param  {jQuery} images
		 *
		 * @return {Promise}
		 */
		parse: function ( images ) {

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

			images.addClass(plugin.classes.isLoading);

			images.each($.proxy( function ( index, element ) {

				element = $(element);
				arr.push(this.aux.loadImage(element.data('src')));
				arr[arr.length-1].always($.proxy(this.success, this, element));

			}, this));

			$.when.apply(window, arr).always(dfd.resolve);

			return dfd.promise();

		},

		/**
		 * @param  {jQuery} image
		 *
		 * @return {}
		 */
		success: function ( image ) {

			image
				.attr({
					src: image.data('src'),
					alt: image.data('alt')
				})
				.removeClass(plugin.classes.isLoading)
				.addClass(plugin.classes.isLoaded);

		},

		destroy: function () {
			dom.destroy.call(this);
			instance.destroy.call(this);
		}

	});

	/**
	 * @class
	 */
	function Postpone () {
		Postpone._super.constructor.apply(this, arguments);

	}
	function PostponeTemp () {}
	PostponeTemp.prototype = Lazyload.prototype;
	Postpone.prototype = new PostponeTemp();
	Postpone.prototype.constructor = Postpone;
	Postpone._super = Lazyload.prototype;

	$.extend(Postpone.prototype, {

		parse: function ( images ) {

			images.inView({
				threshold: this.options.threshold,
				debounce: this.options.debounce,
				once: $.proxy(function ( result ) {

					if ( this.options.start ) {
						this.options.start.call(this._element, result);
					}

					Postpone._super.parse.call(this, result)
						.done($.proxy(function () {

							if ( this.options.success ) {
								this.options.success.call(this._element, result);
							}

						}, this));

				}, this)
			});

		},

		destroy: function () {
			Postpone._super.destroy.call(this);
			this.dom.el.inView('destroy');
		},

		defaults: {
			threshold: 0,
			debounce: 300,
			success: null,
			start: null
		}

	});

	$.kist = $.kist || {};

	$.kist[plugin.name] = {
		postpone: {
			defaults: Postpone.prototype.defaults
		}
	};

	$.fn[plugin.name] = function ( options ) {

		if ( typeof(options) === 'string' && $.inArray(options, plugin.publicMethods) !== -1 ) {
			return this.each(function () {
				var pluginInstance = $.data(this, plugin.name);
				if ( pluginInstance ) {
					pluginInstance[options]();
				}
			});
		}

		options = constructOptions(options);
		var Method = constructMethod(options);

		/**
		 * If there are multiple elements, first filter those which don’t
		 * have any instance of plugin instantiated. Then create only one
		 * instance for current collection which will enable us to have
		 * only one scroll/resize event.
		 */
		var collection = this.filter(function () {
			return !$.data(this, plugin.name) && $(this).is('img');
		});
		if ( collection.length ) {
			collection.data(plugin.name, new Method(collection, options));
		}

		return this;

	};

})( jQuery, window, document );
