/* kist-postimg 0.1.1 - Load images via postpone or lazyload method. | Author: Ivan Nikolić, 2014 | License: MIT */
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

		// Does the current collection have any images which are already defined
		// as postimg images? If that’s true, filter those images and return
		// only those which are candidtes for postimg resolution.
		// Otherwise, if there is no image returned, don’t run any event setup
		// or image parsing methods.
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

		// Parse through visible images
		this.parseImages( this.domRefs.imagesEl.KistInView('getElementsInView', this.settings.threshold) );

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

		arrImages.each($.proxy( function ( index, element ) {

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
