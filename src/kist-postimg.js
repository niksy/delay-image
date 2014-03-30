;(function ( $, window, document, undefined ) {

	var pluginName           = 'KistPostimg';
	var pluginDomNamespace   = 'kist-postimg';
	var pluginClassNamespace = 'KistPostimg';
	var pluginEventNamespace = 'kist.postimg';

	var KistPostimg = function ( element, options ) {
		this._element = element;
		this.settings = $.extend( {}, this.defaults, options );
	};

	$.extend( KistPostimg.prototype, (function () {

		var o = {};

		/**
		 * Default options
		 *
		 * @type {Object}
		 */
		o.defaults = {
			threshold: 300,
			scrollTimeout: 300,
			loadType: 'postpone'
		};

		o.domRefs = {
			windowEl: $(window)
		};

		/**
		 * Initialize plugin
		 *
		 * @return {Plugin}
		 */
		o.init = function () {

			this.checkPostImgStateDfd = $.Deferred();

			this.getDomRefs();

			// Does the current collection have any images which are already defined
			// as postimg images? If that’s true, filter those images and return
			// only those which are candidtes for postimg resolution.
			// Otherwise, if there is no image returned, don’t run any event setup
			// or image parsing methods.
			$.when( this.checkPostImgState() ).done( $.proxy( this.onCheckPostImgState, this ) );

			return this;

		};

		/**
		 * Get DOM references
		 *
		 * @return {Plugin}
		 */
		o.getDomRefs = function () {

			this.domRefs          = $.extend({}, this.domRefs);
			this.domRefs.imagesEl = $( this._element );

		};

		o.bindUiActions = function () {

			this.domRefs.windowEl.on( 'scroll.' + pluginEventNamespace, $.debounce( this.settings.scrollTimeout, $.proxy( this.fetchImages, this ) ) );
			this.domRefs.windowEl.on( 'resize.' + pluginEventNamespace, $.debounce( this.settings.scrollTimeout, $.proxy( this.fetchImages, this ) ) );

		};

		/**
		 * Check if images already have attached postimg state
		 *
		 * @return {Promise}
		 */
		o.checkPostImgState = function () {

			// Filter only images which are not postimg images
			this.domRefs.imagesEl = this.domRefs.imagesEl.filter(function () { return Boolean( $(this).data('isPostImgAlreadySet') ) === false; });

			// Assign data to those images
			this.domRefs.imagesEl
				.data('isPostImgAlreadySet', true)
				.addClass( pluginClassNamespace );

			if ( this.domRefs.imagesEl.length !== 0 ) {
				this.checkPostImgStateDfd.resolve();
			} else {
				this.checkPostImgStateDfd.reject();
			}

			return this.checkPostImgStateDfd.promise();

		};

		o.onCheckPostImgState = function () {

			this.bindUiActions();
			this.fetchImages();

		};

		/**
		 * Fetch and parse images based on viewport size
		 *
		 * @return {Ui}
		 */
		o.fetchImages = function () {

			// Parse through visible images
			this.parseImages( this.domRefs.imagesEl.KistInView('getElementsInView', this.settings.threshold) );
		// If there are no images, exit early
		if ( this.domRefs.imagesEl === 0 ) {
			return;
		}


		};

		/**
		 * Parse images
		 *
		 * @param  {$Object} arrImages
		 *
		 * @return {Ui}
		 */
		o.parseImages = function ( arrImages ) {

			arrImages.each($.proxy( function ( index, element ) {
/*
// Filter images for Picture parser
arrPictureParse = arrImages.filter(function () { return typeof($(this).data('picture')) != 'undefined'; });
if ( arrPictureParse.length !== 0 ) {

			if ( !window.hasOwnProperty('Picture') ) {
				throw new Error('Picture parser is not available.');
			}

			// Parse images with picture parser
			window.Picture.parse( arrPictureParse.get() );

		}*/

				var imageEl = $(element);

				$.loadImage( imageEl.data('src') ).done($.proxy( function () {

					imageEl
						.attr('src', imageEl.data('src'))
						.attr('alt', imageEl.data('alt'))
						.removeAttr('width').removeAttr('height')
						.addClass( pluginClassNamespace + '--is-loaded' );

					this.domRefs.imagesEl = this.domRefs.imagesEl.not( imageEl );

				}, this));

			}, this));

		};

		return o;
	})() );
	var KistPostimgLazyLoad = function ( element, options ) {
		KistPostimg.call( this, element, options );
	};
	KistPostimgLazyLoad.prototype             = new KistPostimg();
	KistPostimgLazyLoad.prototype.constructor = KistPostimgLazyLoad;
	$.extend( KistPostimgLazyLoad.prototype, (function () {
		var o = {};

		o.onCheckPostImgState = function () {

			this.fetchImages();

		};

		/**
		 * Fetch and parse lazyloaded images
		 *
		 * @return {Ui}
		 */
		o.fetchImages = function () {

			// Parse through images
			this.parseImages( this.domRefs.imagesEl );

		};

		return o;

	})() );

	$[ pluginName ]           = {};
	$[ pluginName ].instances = [];
	$[ pluginName ].defaults  = KistPostimg.prototype.defaults;

	/**
	 * Fetch images for all plugin instances
	 *
	 * @return {Ui}
	 */
	$[ pluginName ].fetchAllImages = function () {

		$.each( this.instances, function ( index, instance ) {
			instance.fetchImages();
		});

	};

	$.fn[ pluginName ] = function ( options ) {

		options = options || {};

		if ( options.loadType === 'lazyload' ) {
			$[ pluginName ].instances.push( new KistPostimgLazyLoad( this, options ).init() );
		} else {
			$[ pluginName ].instances.push( new KistPostimg( this, options ).init() );
		}

		return this;

	};

})( jQuery, window, document );
