var dom = require('./dom');
var meta = require('./meta');
var emit = require('kist-toolbox/lib/event-emitter')(meta.name);

/**
 * @this {Lazyload|Postpone}
 *
 * @param  {jQuery} images
 */
module.exports = function ( images ) {
	emit(this, 'success', [images], dom.$doc);
};
