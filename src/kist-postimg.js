;(function ( $, window, document, undefined ) {

	var o                    = {};
	var pluginName           = 'KistPostimg';
	var pluginDomNamespace   = 'kist-postimg';
	var pluginClassNamespace = 'KistPostimg';
	var pluginEventNamespace = 'kist.postimg';

	var PluginModule = function ( element, options ) {

		this._element  = element;
		this.settings  = $.extend( {}, this.defaults, options );

	};

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

		$.when( this.checkPostImgState() ).done($.proxy( function () {

			this.bindUiActions();
			this.fetchPostponedImages();
			this.fetchLazyLoadedImages();

		}, this));

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

		this.domRefs.windowEl.on( 'scroll.' + pluginEventNamespace, $.debounce(this.settings.scrollTimeout, $.proxy( this.fetchPostponedImages, this )));
		this.domRefs.windowEl.on( 'resize.' + pluginEventNamespace, $.debounce(this.settings.scrollTimeout, $.proxy( this.fetchPostponedImages, this )));

	};

	/**
	 * Check if images already have attached postimg state
	 *
	 * @return {Promise}
	 */
	o.checkPostImgState = function () {

		this.domRefs.imagesEl.each($.proxy( function ( mIndex, mElement ) {

			var element = $(mElement);

			if ( Boolean( element.data('isPostImgAlreadySet') ) === false ) {

				element.data('isPostImgAlreadySet', true);
				element.addClass( pluginClassNamespace );

			} else {

				this.removeFromImageCollection( element );

			}

		}, this));

		if ( this.domRefs.imagesEl.length !== 0 ) {
			this.checkPostImgStateDfd.resolve();
		} else {
			this.checkPostImgStateDfd.reject();
		}

		return this.checkPostImgStateDfd.promise();

	};

	/**
	 * Fetch and parse images based on viewport size
	 *
	 * @return {Ui}
	 */
	o.fetchPostponedImages = function () {

		// Don’t do anything if we’re not dealing with postpone collection
		if ( this.settings.loadType !== 'postpone' ) {
			return;
		}

		// Get list of visible images
		var arrVisibleImages = this.getVisibleImages();

		// If there are no visible images, exit early
		if ( arrVisibleImages.length === 0 ) {
			return;
		}

		// Parse through visible images
		this.parseImages( arrVisibleImages );

	};

	/**
	 * Fetch and parse lazyloaded images
	 *
	 * @return {Ui}
	 */
	o.fetchLazyLoadedImages = function () {

		// Don’t do anything if we’re not dealing with lazyload collection
		if ( this.settings.loadType !== 'lazyload' ) {
			return;
		}

		// Parse through images
		this.parseImages( this.domRefs.imagesEl );

	};

	/**
	 * Parse images
	 *
	 * @param  {$Object} arrImages
	 *
	 * @return {Ui}
	 */
	o.parseImages = function ( arrImages ) {

		var arrPictureParse;
		var arrStandardParse;

		// Filter images for Picture parser
		arrPictureParse = arrImages.filter(function () { return typeof($(this).data('picture')) != 'undefined'; });

		// Filter images for standard parser
		arrStandardParse = arrImages.filter(function () { return $(this).is('img') === true; });

		if ( arrPictureParse.length !== 0 ) {

			if ( !window.hasOwnProperty('Picture') ) {
				throw new Error('Picture parser is not available.');
			}

			// Parse images with picture parser
			window.Picture.parse( arrPictureParse.get() );

		} else if ( arrStandardParse.length !== 0 ) {

			// Parse images with standard parser
			arrStandardParse.each(function (index, element) {

				var imageEl = $(element);

				$.loadImage( imageEl.data('src') ).done(function () {

					imageEl
						.attr('src', imageEl.data('src'))
						.attr('alt', imageEl.data('alt'))
						.removeAttr('width').removeAttr('height')
						.addClass( pluginClassNamespace + '--is-loaded' );

				});

			});

		}

	};

	/**
	 * Get images visible inside viewport
	 *
	 * @return {Array}
	 */
	o.getVisibleImages = function () {

		var images;

		// Filter images in view
		images = this.domRefs.imagesEl.KistInView('getElementsInView', this.settings.threshold);

		// Store new reference for images array: new array will be all images
		// except currently filtered ones. This way we reduce DOM matching to minimum.
		this.domRefs.imagesEl = this.domRefs.imagesEl.not(images);

		// Return array of images
		return images;

	};

	/**
	 * Add to image collection
	 *
	 * @param  {$Object} pCollection
	 *
	 * @return {Array}
	 */
	o.addToImageCollection = function ( pCollection ) {

		this.domRefs['imagesEl'] = this.domRefs['imagesEl'].add( $(pCollection) );

	};

	/**
	 * Remove from image collection
	 *
	 * @param  {$Object} pCollection
	 *
	 * @return {Array}
	 */
	o.removeFromImageCollection = function ( pCollection ) {

		this.domRefs['imagesEl'] = this.domRefs['imagesEl'].not( $(pCollection) );

	};

	$.extend( PluginModule.prototype, o );

	$[ pluginName ]           = {};
	$[ pluginName ].instances = [];
	$[ pluginName ].defaults  = PluginModule.prototype.defaults;

	/**
	 * Fetch images for all plugin instances
	 *
	 * @return {Ui}
	 */
	$[ pluginName ].fetchAllImages = function () {

		$.each( this.instances, function ( index, instance ) {

			instance.fetchPostponedImages();
			instance.fetchLazyLoadedImages();

		});

	};

	$.fn[ pluginName ] = function ( options ) {

		$[ pluginName ].instances.push( new PluginModule( this, options ).init() );

		return this;

	};

})( jQuery, window, document );
