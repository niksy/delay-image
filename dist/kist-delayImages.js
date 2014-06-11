/*! kist-delayImages 0.2.1 - Delay images via postpone or lazyload. | Author: Ivan Nikolić, 2014 | License: MIT */
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

			this.dom.el.addClass(plugin.classes.image);
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
				delete $.data(element)[plugin.name + '-inView'];
			});
		}
	};

	var aux = {
		setup: function () {
			this.aux = this.aux || {};
			this.aux.loadImage = $.proxy($.kist.loader.loadImage, $.kist.loader);
		}
	};

	function resolveOptions ( method, options ) {

		var o = {};

		switch (typeof(method)) {
			case 'string':
				o.method = method;
				break;
			case 'object':
				$.extend(o, method);
				break;
			default:
				o.method = 'lazyload';
				break;
		}

		switch (typeof(options)) {
			case 'object':
				$.extend(o, options);
				break;
			case 'function':
				o.success = options;
				break;
		}

		return o;

	}

	function resolveMethod ( options ) {

		switch (options.method) {
			case 'lazyload':
				return Lazyload;
			case 'postpone':
				return Postpone;
			default:
				plugin.error('Unsupported method "' + options.method + '".');
				break;
		}

	}

	function cleanOptions ( options ) {

		switch (options.method) {
			case 'lazyload':
				options = {};
				break;
			case 'postpone':
				delete options.method;
				break;
		}

		return options;
	}

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
		 */
		parse: function ( images ) {

			images.each($.proxy( function ( index, element ) {

				element = $(element);
				element.addClass(plugin.classes.isLoading);

				this.aux.loadImage(element.data('src')).done($.proxy(this.onParse, this, element));

			}, this));

		},

		/**
		 * @param  {jQuery} image
		 */
		onParse: function ( image ) {

			image
				.attr({
					src: image.data('src'),
					alt: image.data('alt')
				})
				.removeAttr('width height')
				.removeClass(plugin.classes.isLoading)
				.addClass(plugin.classes.isLoaded);

		},

		destroy: function () {
			instance.destroy.call(this);
		}

	});

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

			this.remaining = images.length;

			images.inView({
				threshold: this.options.threshold,
				debounce: this.options.debounce,
				success: $.proxy(function ( el ) {

					if ( this.remaining === 0 ) {
						this.destroy();
						return;
					}

					if ( this.options.success ) {
						this.options.success.call(null, el);
					}
					Postpone._super.parse.call(this, el);

				}, this)
			});

		},

		onParse: function ( image ) {
			Postpone._super.onParse.apply(this, arguments);
			if ( image.data(plugin.name + '-inView') ) {
				return;
			}
			image.data(plugin.name + '-inView', true);
			this.remaining--;
		},

		destroy: function () {
			Postpone._super.destroy.call(this);
			this.dom.el.inView('destroy');
		},

		defaults: {
			threshold: 0,
			debounce: 300
		}

	});

	$.kist = $.kist || {};

	$.kist[plugin.name] = {
		postpone: {
			defaults: Postpone.prototype.defaults
		}
	};

	$.fn[plugin.name] = function ( method, options ) {

		var Method;

		if ( typeof(method) === 'string' && $.inArray(method, plugin.publicMethods) !== -1 ) {
			return this.each(function () {
				var pluginInstance = $.data(this, plugin.name);
				if ( pluginInstance ) {
					pluginInstance[method]();
				}
			});
		}

		options = resolveOptions(method, options);
		Method = resolveMethod(options);
		options = cleanOptions(options);

		/**
		 * Get collection of images instead of single image
		 */
		this
			.filter(function ( element ) {
				return !$.data(element, plugin.name);
			})
			.data(plugin.name, new Method( this, options ));

		return this;

	};

})( jQuery, window, document );
