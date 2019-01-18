# delay-image

[![Build Status][ci-img]][ci] [![BrowserStack Status][browserstack-img]][browserstack]

Delay image load until it’s in viewport.

## Install

```sh
npm install delay-image --save
```

## Usage

By default, it will look for `data-src` attribute on image element and add `src` attribute when image has been successfully loaded.

```html
<img id="jackie" data-src="jackie.jpg" />
```

```js
import delayImage from 'delay-image';

delayImage(document.querySelector('#jackie'), {
	onEnter: ( element ) => {
		// Image in viewport!
	}
});
```

## API

### delayImage(element, options)

Delay image load until it’s in viewport.

#### element

Type: `Element`

Image element.

#### options

Type: `Object`

| Property | Type | Default value | Description |
| --- | --- | --- | --- |
| `threshold` | `Number` | `0` | Positive value in pixels which will signal plugin to check for image presence earlier in document. |
| `debounce` | `Number` | `300` | Time in milliseconds which will be used to debounce callback execution. |
| `imageSource` | `String` | `element.getAttribute('data-src')` | Image URL to load. |
| `onEnter` | `Function` | `() => {}` | Callback to execute if image is within viewport (useful for loader initialization). |
| `onSuccess` | `Function` | `( element ) => { element.src = imageSource; }` | Callback to execute if image has been successfully loaded. **If you define this callback, you need to add `src` attribute yourself.** |
| `onFail` | `Function` | `() => { ... }` | Callback to execute if image has failed to load. |

### instance.destroy()

Destroy instance.

## Browser support

Tested in IE9+ and all modern browsers.

## Test

For automated tests, run `npm run test:automated` (append `:watch` for watcher support).

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.com/niksy/delay-image
[ci-img]: https://travis-ci.com/niksy/delay-image.svg?branch=master
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=Mko4TDFSTXgxUVpsTTF0TGozMWVzLzV5clB3ZXQxZm1yc1NYdE5KdG5BVT0tLWdJRy9DQktNSmozSjlsSXE0RjkvTGc9PQ==--589d59d7ed51a7d2bf3f198127c7ef149a2ad1a2
