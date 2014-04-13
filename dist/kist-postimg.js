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
