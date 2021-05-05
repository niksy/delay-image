# delay-image

[![Build Status][ci-img]][ci]
[![BrowserStack Status][browserstack-img]][browserstack]

Delay image load until it’s in viewport.

## Install

```sh
npm install delay-image --save
```

## Usage

By default, it will look for `data-src` attribute on image element and add `src`
attribute when image has been successfully loaded.

```html
<img id="jackie" data-src="jackie.jpg" />
```

```js
import delayImage from 'delay-image';

delayImage(document.querySelector('#jackie'), {
	onEnter: (element) => {
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

| Property              | Type       | Default value                                 | Description                                                                                                                                                                                                                                          |
| --------------------- | ---------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `threshold`           | `number`   | `0`                                           | Positive value in pixels which will signal plugin to check for image presence earlier in document.                                                                                                                                                   |
| `scrollResizeHandler` | `Function` | `300`                                         | Window scroll and resize event handler. Useful if you want to use [throttle or debounce methods](https://github.com/niksy/element-within-viewport#throttle-debounce-scroll-resize) on those events. Should return new handler (original or wrapped). |
| `imageSource`         | `string`   | `element.getAttribute('data-src')`            | Image URL to load.                                                                                                                                                                                                                                   |
| `onEnter`             | `Function` | `() => {}`                                    | Callback to execute if image is within viewport (useful for loader initialization).                                                                                                                                                                  |
| `onSuccess`           | `Function` | `(element) => { element.src = imageSource; }` | Callback to execute if image has been successfully loaded. **If you define this callback, you need to add `src` attribute yourself.**                                                                                                                |
| `onFail`              | `Function` | `() => { ... }`                               | Callback to execute if image has failed to load.                                                                                                                                                                                                     |

### instance.destroy()

Destroy instance.

## Browser support

Tested in Edge 15, Chrome 72 and Firefox 65, and should work in all modern
browsers
([support based on Browserslist configuration](https://browserslist.dev/?q=bGFzdCAzIG1ham9yIHZlcnNpb25zLCBzaW5jZSAyMDE5LCBlZGdlID49IDE1LCBub3QgaWUgPiAw)).

## Test

For automated tests, run `npm run test:automated` (append `:watch` for watcher
support).

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

<!-- prettier-ignore-start -->

[ci]: https://travis-ci.com/niksy/delay-image
[ci-img]: https://travis-ci.com/niksy/delay-image.svg?branch=master
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=MGV1ZTVGN0tFSHU5alpRUW54SFZwcnh1aDZrUHVOc3AySDdUenYyQkdHYz0tLW9vUjVjeG4rbU14YjNpbXpYU2tlV0E9PQ==--2683e49bc19f3e9bf2dbd4c65fa7a3a8e6809318

<!-- prettier-ignore-end -->
