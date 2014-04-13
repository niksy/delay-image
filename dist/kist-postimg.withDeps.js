/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
// 
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
// 
// About: Release History
// 
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
// 
// Topic: Note for non-jQuery users
// 
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
// 
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),
    
    // Internal method reference.
    jq_throttle;
  
  // Method: jQuery.throttle
  // 
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  // 
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  // 
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // > 
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  // 
  // Usage:
  // 
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, throttled, function.
  
  $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,
      
      // Keep track of the last time `callback` was executed.
      last_exec = 0;
    
    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }
    
    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;
      
      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };
      
      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };
      
      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }
      
      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );
      
      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();
        
      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        // 
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        // 
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };
    
    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ( $.guid ) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }
    
    // Return the wrapper function.
    return wrapper;
  };
  
  // Method: jQuery.debounce
  // 
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  // 
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  // 
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // > 
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  // 
  // Usage:
  // 
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, debounced, function.
  
  $.debounce = function( delay, at_begin, callback ) {
    return callback === undefined
      ? jq_throttle( delay, at_begin, false )
      : jq_throttle( delay, callback, at_begin !== false );
  };
  
})(this);

/* kist-inview 0.3.0 - Check if elements are in viewport. | Author: Ivan Nikolić, 2014 | License: MIT */
;(function ( $, window, document, undefined ) {

	var o                    = {};
	var pluginName           = 'KistInView';
	var pluginDomNamespace   = 'kist-inview';
	var pluginEventNamespace = 'kist.inview';
	var isFirstTime          = true;

	var recalculateViewport = function () {
		o.defaults.windowElTop    = o.defaults.domRefs.windowEl.scrollTop();
		o.defaults.windowElBottom = o.defaults.windowElTop + o.defaults.domRefs.windowEl.height();
	};

	/**
	 * Defaults
	 *
	 * @type {Object}
	 */
	o.defaults = {
		threshold: 0,
		windowElTop: 0,
		windowElBottom: 0,
		domRefs: {
			windowEl: $(window)
		}
	};

	/**
	 * Check if element is partially visible in viewport
	 *
	 * @param  {$DomRef}  pElement
	 * @param  {Number}  pThreshold
	 *
	 * @return {Boolean}
	 */
	o.isInView = function ( pElement, pThreshold ) {

		var elTop    = pElement.offset().top;
		var elBottom = elTop + pElement.height();

		return elBottom >= o.defaults.windowElTop - pThreshold && elTop <= o.defaults.windowElBottom + pThreshold;

	};

	/**
	 * Return list of visible elements in viewport
	 *
	 * @param  {$DomRef}  pElements
	 * @param  {Number}  pThreshold
	 *
	 * @return {Object}
	 */
	o.getElementsInView = function ( pElements, pThreshold ) {

		var instance;

		recalculateViewport();
		pThreshold = pThreshold || o.defaults.threshold;

		return pElements.filter(function (index, element) {

			instance = $.data(element, pluginName);

			return o.isInView( instance, pThreshold );

		});

	};

	$[ pluginName ]                     = {};
	$[ pluginName ].recalculateViewport = recalculateViewport;

	$.fn[ pluginName ] = function ( pMethod, pThreshold ) {

		if ( isFirstTime === true ) {
			recalculateViewport();
			isFirstTime = false;
		}

		this.each(function () {
			if ( !$.data( this, pluginName ) ) {
				$.data( this, pluginName, $(this) );
			}
		});

		switch ( pMethod ) {
			case 'isInView':
				return Boolean( o[ 'getElementsInView' ]( this, pThreshold ).length );
			case 'getElementsInView':
				return o[ 'getElementsInView' ]( this, pThreshold );
			default:
				throw new Error( pluginName + ': Method is either undefined or doesn’t exist.' );
		}

	};

})( jQuery, window, document );

/* createCache */
$.createCache = function ( requestFunction ) {
	var cache = {};
	return function ( key, callback ) {
		if ( !cache[ key ] ) {
			cache[ key ] = $.Deferred(function ( defer ) {
				requestFunction( defer, key );
			}).promise();
		}
		return cache[ key ].done( callback );
	};
};

/* loadImage */
$.loadImage = $.createCache(function ( defer, url ) {
	var image = new Image();
	function cleanUp () {
		image.onload = image.onerror = null;
	}
	defer.then( cleanUp, cleanUp );
	image.onload = function () {
		defer.resolve( url );
	};
	image.onerror = defer.reject;
	image.src = url;
});

/* kist-postimg 0.2.1 - Load images via postpone or lazyload method. | Author: Ivan Nikolić, 2014 | License: MIT */
;(function ( $, window, document, undefined ) {

	var pluginName           = 'KistPostimg';
	var pluginDomNamespace   = 'kist-postimg';
	var pluginClassNamespace = 'KistPostimg';
	var pluginEventNamespace = 'kist.postimg';

	var instances = [];

	var RootMethod = function ( element, options ) {
		this.element    = element;
		this.settings   = $.extend( {}, this.defaults, options );
		this.instanceId = 'instance' + new Date().getTime();
	};

	$.extend( RootMethod.prototype, {

		/**
		 * Initialize plugin
		 *
		 * @return {Plugin}
		 */
		init: function () {

			this.dfdImageState = $.Deferred();

			this.getDomRefs();

			/**
			 * Does the current collection have any images which are already defined
			 * as postimg images? If that’s true, filter those images and return
			 * only those which are candidates for postimg resolution.
			 * Otherwise, if there is no image returned, don’t run any event setup
			 * or image parsing methods.
			 */
			$.when( this.checkPostImgState() ).done( $.proxy( this.onCheckPostImgState, this ) );

			return this;

		},

		/**
		 * Get DOM references
		 *
		 * @return {Plugin}
		 */
		getDomRefs: function () {

			this.domRefs          = $.extend({}, this.domRefs);
			this.domRefs.imagesEl = $( this.element );

		},

		/**
		 * Check if images already have attached postimg state
		 *
		 * @return {Promise}
		 */
		checkPostImgState: function () {

			// Filter only images which are not postimg images
			this.domRefs.imagesEl = this.domRefs.imagesEl.filter(function () { return Boolean( $(this).data('isPostImgAlreadySet') ) === false; });

			// Assign data to those images
			this.domRefs.imagesEl
				.data('isPostImgAlreadySet', true)
				.addClass( pluginClassNamespace );

			if ( this.domRefs.imagesEl.length !== 0 ) {
				this.dfdImageState.resolve();
			} else {
				this.dfdImageState.reject();
			}

			return this.dfdImageState.promise();

		},

		/**
		 * Parse images
		 *
		 * @param  {$Object} arrImages
		 *
		 * @return {Ui}
		 */
		parseImages: function ( arrImages ) {

			arrImages.each($.proxy( function ( index, element ) {

				var imageEl = $(element);

				$.loadImage( imageEl.data('src') ).done($.proxy(this.onParsedImage, this, imageEl));

			}, this));

		},

		onParsedImage: function ( imageEl ) {

			imageEl
				.attr('src', imageEl.data('src'))
				.attr('alt', imageEl.data('alt'))
				.removeAttr('width').removeAttr('height')
				.addClass( pluginClassNamespace + '-is-loaded' );

			this.domRefs.imagesEl = this.domRefs.imagesEl.not( imageEl );

		}

	} );

	var PostponeMethod = function ( element, options ) {
		RootMethod.call( this, element, options );
	};
	PostponeMethod.prototype = new RootMethod();

	$.extend( PostponeMethod.prototype, {

		constructor: PostponeMethod,

		/**
		 * Default options
		 *
		 * @type {Object}
		 */
		defaults: {
			threshold: 300,
			scrollTimeout: 300
		},

		domRefs: {
			windowEl: $(window)
		},

		getDomRefs: function () {

			RootMethod.prototype.getDomRefs.call(this);

			this.settings.imagesElRemainingCount = this.domRefs.imagesEl.length;

		},

		bindUiActions: function () {

			this.domRefs.windowEl
				.on( 'scroll.' + this.instanceId + '.' + pluginEventNamespace, $.debounce( this.settings.scrollTimeout, $.proxy( this.fetchImages, this ) ) )
				.on( 'resize.' + this.instanceId + '.' + pluginEventNamespace, $.debounce( this.settings.scrollTimeout, $.proxy( this.fetchImages, this ) ) );

		},

		unbindUiActions: function () {

			this.domRefs.windowEl.off( '.' + this.instanceId + '.' + pluginEventNamespace );

		},

		onCheckPostImgState: function () {

			this.bindUiActions();
			this.fetchImages();

		},

		/**
		 * Fetch and parse images based on viewport size
		 *
		 * @return {Ui}
		 */
		fetchImages: function () {

			// If there are no more images to parse, unbind window events
			if ( this.settings.imagesElRemainingCount === 0 ) {
				this.unbindUiActions();
			}

			// Parse through visible images
			this.parseImages( this.domRefs.imagesEl.KistInView('getElementsInView', this.settings.threshold) );

		},

		onParsedImage: function () {

			RootMethod.prototype.onParsedImage.apply(this, arguments);

			this.settings.imagesElRemainingCount--;

		}

	} );

	var LazyLoadMethod = function ( element, options ) {
		RootMethod.call( this, element, options );
	};
	LazyLoadMethod.prototype = new RootMethod();

	$.extend( LazyLoadMethod.prototype, {

		constructor: LazyLoadMethod,

		onCheckPostImgState: function () {

			this.fetchImages();

		},

		/**
		 * Fetch and parse lazyloaded images
		 *
		 * @return {Ui}
		 */
		fetchImages: function () {

			// Parse through images
			this.parseImages( this.domRefs.imagesEl );

		}

	} );

	$[pluginName] = {

		instances: instances,
		defaults: PostponeMethod.prototype.defaults,

		/**
		 * Fetch images for all plugin instances
		 *
		 * @return {Ui}
		 */
		fetchAllImages: function () {

			$.each( instances, function ( index, instance ) {
				instance.fetchImages();
			});

		}

	};

	$.fn[pluginName] = function ( type, options ) {

		if ( $.type(arguments[0]) !== 'string' ) {
			throw new Error(pluginName + ': Please provide image loading method.');
		}

		if ( type === 'postpone' ) {
			instances.push( new PostponeMethod( this, options ).init() );
		} else if ( type === 'lazyload' ) {
			instances.push( new LazyLoadMethod( this ).init() );
		}

		return this;

	};

})( jQuery, window, document );
