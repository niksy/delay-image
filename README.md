# kist-delayimages

Load images via [postpone](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html#attr-postpone) or [lazyload](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html#attr-lazyload) method.

## Installation

```sh
npm install kist-delayimages --save

bower install kist-delayimages --save
```

## API

Following API description assumes you use this module as jQuery plugin.

### `$(Element).delayImages([options])`

Returns: `jQuery`

#### options

Type: `Object|String`

##### Options defined as `Object`

| Property | Type | Description | Default value |
| --- | --- | --- | --- |
| `method` | `String` | Image loading method to use. Possible values are `lazyload` and `postpone`. | `lazyload` |
| `threshold` | `Number` | Value in pixels which will signal plugin to check for image presence earlier in document. | `0` |
| `debounce` | `Number` | Time in milliseconds which will be used to debounce callback execution. | `300` |
| `srcDataProp` | `String` | `data` property with image source. | `src` |
| `altDataProp` | `String` | `data` property with image alt text. | `alt` |
| `start` | `Function` | [Detailed description](#start) | `$.noop` |
| `success` | `Function` | [Detailed description](#success) | `$.noop` |

###### start

If called with lazyload method, callback will execute before all images have been loaded.  
If called with postpone method, callback will execute if there are images inside viewport and before those images have been loaded.

Provides one argument: all lazyloaded images (if lazyload) or all images in viewport (if postpone). It also triggers `delayimagesstart` event on `document` with same arguments.

###### success

If called with lazyload method, callback will execute after all images have been loaded.  
If called with postpone method, callback will execute if there are images inside viewport and after those images have been loaded.

Provides one argument: all lazyloaded images (if lazyload) or all images in viewport (if postpone). It also triggers `delayimagessuccess` event on `document` with same arguments.

##### Options defined as `String`

###### destroy

Destroy plugin instance.

### `$.fn.delayImages.defaults.lazyload`

Type: `Object`

Change defaults for lazyload method.

### `$.fn.delayImages.defaults.postpone`

Type: `Object`

Change defaults for postpone method. It will inherit properties from lazyload method defaults.

## Examples

Default structure for delayed images.

```html
<img data-src="example.png" data-alt="Example" />
```

Lazyload images.

```js
$('img').delayImages();

$('img').delayImages({
	method: 'lazyload'
});
```

Postpone images with default options.

```js
$('img').delayImages({
	method: 'postpone'
});
```

Callback when postponed images with default options are in viewport.

```js
$('img').delayImages({
	method: 'postpone',
	success: function ( images ) {
		console.log('Images are in viewport!');
	}
});
```

Callback when postponed images with 300px threshold and 300ms debounce are in viewport.

```js
$('img').delayImages({
	method: 'postpone',
	threshold: 300,
	debounce: 300,
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
```

Destroy plugin instance.

```js
$('img').delayImages('destroy');
```

### AMD and global

```js
define(['kist-delayimages'], cb);

window.$.fn.delayImages;
```

## Caveats

For postponed images to load properly (only visible in viewport), some dimension 
(height) needs to be set for them, otherwise browser will try to download every
image in collection.

## Browser support

Tested in IE8+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
