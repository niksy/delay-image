# Changelog

## [Unreleased][]

### Changed

-   Update dependencies
-   Make module ESM only

### Removed

-   **Breaking**: Drop IE support, supported browser is Edge 15+

## [2.0.0][] - 2020-02-20

### Changed

-   Abstract scroll and resize event handling, so events could be wrapped with
    more functionality (e.g. throttle)
-   Lock `image-promise` to `6.0.2` since we need IE9 support

### Added

-   `scrollResizeHandler` property

### Removed

-   `debounce` property

## [1.0.0][] - 2019-01-18

### Added

-   Refactored implementation

<!-- prettier-ignore-start -->

[1.0.0]: https://github.com/niksy/delay-image/tree/v1.0.0
[2.0.0]: https://github.com/niksy/delay-image/tree/v2.0.0

<!-- prettier-ignore-end -->
