# kist-delayImages

Load images via [postpone](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html#attr-postpone) or [lazyload](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html#attr-lazyload) method.

## Installation

```sh
bower install niksy/kist-delayImages
```

## API

### `Element.delayImages([method], [options])`

Returns: `jQuery`

#### method

Type: `String|Object`

##### Method defined as `String`

Type: `String`  
Default: `lazyload`

Image loading method to use. Possible values are `lazyload` and `postpone`.

###### destroy

Destroy plugin instance.

##### Method defined as `Object`

###### method

Type: `String`  
Default: `lazyload`

Image loading method to use. Possible values are `lazyload` and `postpone`.

###### threshold

Type: `Integer`  
Default: `0`

Value in pixels which will signal plugin to check for image presence earlier in document.

###### debounce

Type: `Integer`  
Default: `300`

If [debounce plugin](https://github.com/niksy/jquery-throttle-debounce) is available, time in milliseconds which will be used to debounce callback execution.

###### success

Type: `Function`  
Returns: ( [Images in viewport] )

Callback to execute if there are images inside viewport.

#### success

Type: `Function`  
Returns: ( [Images in viewport] )

Callback to execute if there are images inside viewport.

#### options

Type: `Object|Function`

##### Options defined as `Object`

[See "Method defined as `Object`"](#method-defined-as-object).

##### Options defined as `Function`

Type: `Function`  
Returns: ( [Images in viewport] )

Callback to execute if there are images inside viewport.

### Global options

#### `$.delayImages.postpone.defaults`

Type: `Object`

Change defaults for postpone method.

## Examples

Lazyload images.

```js
$('img').delayImages();
```

Postpone images with default options.

```js
$('img').delayImages('postpone');
```

Callback when postponed images with default options are in viewport.

```js
$('img').delayImages('postpone', function ( images ) {
	console.log('Images are in viewport!');
});
```

Callback when postponed images with 300px threshold and 300ms debounce are in viewport.

```js
$('img').delayImages('postpone', {
	threshold: 300,
	debounce: 300,
	success: function ( images ) {
		console.log('Images are in viewport!');
	}
});

$('img').delayImages({
	method: 'postpone',
	threshold: 300,
	debounce: 300,
}, function ( images ) {
	console.log('Images are in viewport!');
});

$('img').delayImages({
	method: 'postpone',
	threshold: 300,
	debounce: 300,
	success: function ( images ) {
		cb();
	}
});
```

Destroy plugin instance.

```js
$('img').delayImages('destroy');
```

## Caveats

For postponed images to load properly (only visible in viewport), some dimension 
(height) needs to be set for them, otherwise browser will try to download every
image in collection.

## Browser support

Tested in IE8+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
