// Lazyload
$('img').delayImages();
$('img').delayImages({
	method: 'lazyload'
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
