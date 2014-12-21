var $ = require('jquery');
var meta = require('./meta');
var isPublicMethod = require('kist-toolbox/lib/is-public-method')(meta.publicMethods);
var Lazyload = require('./lazyload');
var Postpone = require('./postpone');

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
