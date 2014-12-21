/*! kist-delayimages 0.4.1 - Delay images via postpone or lazyload. | Author: Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/), 2014 | License: MIT */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self);var n=f;n=n.jQuery||(n.jQuery={}),n=n.fn||(n.fn={}),n.delayImages=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

module.exports = {
	$doc: $(document),
	setup: function () {
		this.$el = $(this.element);

		this.$el.addClass(this.options.classes.image);
	},
	destroy: function () {
		$.each(this.options.classes, $.proxy(function ( prop, className ) {
			this.$el.removeClass(className);
		}, this));
	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var meta = require(5);
var isPublicMethod = require(11)(meta.publicMethods);
var Lazyload = require(4);
var Postpone = require(7);

// @hattip https://github.com/niksy/modernizr-detects/blob/master/feature-detects/proxybrowser.js
var isProxyBrowser = (('Modernizr' in window) && Modernizr.proxybrowser) || (/Opera Mini|Silk/i.test(navigator.userAgent));

/**
 * @param  {String} options
 *
 * @return {Function}
 */
function constructMethod ( options ) {
	if ( options.method === 'postpone' ) {
		return isProxyBrowser ? Lazyload : Postpone;
	}
	return Lazyload;
}

var plugin = module.exports = function ( options ) {

	options = options || {};

	if ( isPublicMethod(options) ) {
		return this.each(function () {
			var instance = $.data(this, meta.name);
			if ( instance ) {
				instance[options]();
			}
		});
	}

	options = typeof(options) === 'object' ? options : {};
	var Method = constructMethod(options);

	/**
	 * If there are multiple elements, first filter those which don’t
	 * have any instance of plugin instantiated. Then create only one
	 * instance for current collection which will enable us to have
	 * only one scroll/resize event.
	 */
	var collection = this.filter(function () {
		return !$.data(this, meta.name) && $(this).is('img');
	});
	if ( collection.length ) {
		collection.data(meta.name, new Method(collection, options));
	}

	return this;

};
plugin.defaults = {
	lazyload: Lazyload.prototype.defaults,
	postpone: Postpone.prototype.defaults
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var meta = require(5);
var instance = 0;

module.exports = {
	setup: function () {
		this.uid = instance++;
		this.ens = meta.ns.event + '.' + this.uid;
	},
	destroy: function () {
		this.$el.each(function ( index, element ) {
			$.removeData(element, meta.name);
		});
	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Klass = require(8);
var loadImage = (typeof window !== "undefined" ? window.$.kist.loader : typeof global !== "undefined" ? global.$.kist.loader : null).loadImage;
var meta = require(5);
var instance = require(3);
var dom = require(1);
var onSuccess = require(6);
var emit = require(10)(meta.name);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
module.exports = {
	name: 'delayImages',
	ns: {
		htmlClass: 'kist-DelayImages',
		event: '.kist.delayImages'
	},
	publicMethods: ['destroy']
};

},{}],6:[function(require,module,exports){
var dom = require(1);
var meta = require(5);
var emit = require(10)(meta.name);

/**
 * @this {Lazyload|Postpone}
 *
 * @param  {jQuery} images
 */
module.exports = function ( images ) {
	emit(this, 'success', [images], dom.$doc);
};

},{}],7:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Lazyload = require(4);
var onSuccess = require(6);
$.fn.inViewport = (typeof window !== "undefined" ? window.$.fn.inViewport : typeof global !== "undefined" ? global.$.fn.inViewport : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
var objExtend = require(9);

/**
 * @param  {Object} protoProps
 * @param  {Object} staticProps
 *
 * @return {Function}
 */
function extend ( protoProps, staticProps ) {

	var self = this;
	var Child;

	if ( protoProps && protoProps.hasOwnProperty('constructor') ) {
		Child = protoProps.constructor;
	} else {
		Child = function () {
			Child._super.constructor.apply(this, arguments);
		};
	}

	objExtend(Child, self, staticProps);

	function ChildTemp () {}
	ChildTemp.prototype = self.prototype;
	Child.prototype = new ChildTemp();
	Child.prototype.constructor = Child;
	Child._super = self.prototype;

	if ( protoProps ) {
		objExtend(Child.prototype, protoProps);
	}

	return Child;

}

var Klass = module.exports = function () {};
Klass.extend = extend;

},{}],9:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],10:[function(require,module,exports){
(function (global){
/* jshint maxparams:false */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

/**
 * @param  {String} name
 *
 * @return {Function}
 */
module.exports = function ( name ) {

	/**
	 * @param  {Object}   ctx
	 * @param  {String}   eventName
	 * @param  {Array}    data
	 * @param  {jQuery}   triggerEl
	 */
	return function ( ctx, eventName, data, triggerEl ) {
		var el = (ctx.dom && ctx.dom.el) || ctx.$el || $({});
		if ( ctx.options[eventName] ) {
			ctx.options[eventName].apply((el.length === 1 ? el[0] : el.toArray()), data);
		}
		(triggerEl || el).trigger(((name || '') + eventName).toLowerCase(), data);
	};

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

/**
 * @param  {Array} methods
 *
 * @return {Function}
 */
module.exports = function ( methods ) {

	/**
	 * @param  {String} name
	 *
	 * @return {Boolean}
	 */
	return function ( name ) {
		return typeof(name) === 'string' && $.inArray(name, methods || []) !== -1;
	};

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2])(2)
});