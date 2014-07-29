// Lazyload
$('img').delayImages();
$('img').delayImages('lazyload');
$('img').delayImages({
	method: 'lazyload'
});

// Postpone
$('img').delayImages('postpone');
$('img').delayImages('postpone', function ( images ) {
	cb();
});
$('img').delayImages('postpone', {
	threshold: 300,
	debounce: 300,
	success: function ( images ) {
		cb();
	}
});
$('img').delayImages({
	method: 'postpone',
	threshold: 300,
	debounce: 300,
}, function ( images ) {
	cb();
});
$('img').delayImages({
	method: 'postpone',
	threshold: 300,
	debounce: 300,
	start: function ( images ) {
		cb();
	},
	success: function ( images ) {
		cb();
	}
});

// API calls
$('img').delayImages('destroy');

// Defaults
$.delayImages.postpone.defaults = {
	threshold: 300,
	debounce: 300,
	success: null,
	start: null
};
