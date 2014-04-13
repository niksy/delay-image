# Kist Postimg

Load images via [postpone](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html#attr-postpone) or [lazyload](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html#attr-lazyload) method.

## Usage

1. Include jQuery, plugin and necessary dependancies (see `bower.json` for details).

    ```html
    <script src="jquery.min.js"></script>
    <script src="dist/kist-postimg.min.js">

    <img data-src="image.png" />
    ```

3. Initialize plugin.

    ```javascript
    $('img').KistPostimg('postpone', { threshold: 200 });
    ```

## API

### `KistPostimg( method, options )`

#### `method`

Type: `String`  

Required. Valid options are "postpone" and "lazyload".

#### `options`

Type: `Objecet`

Valid only for "postpone" load method.

##### `threshold`

Type: `Number`  
Default value: `300`

Check for images presence 300px in upwards and downards direction and loads them
if they are in that view. Valid only for postponed images.

##### `scrollTimeout`

Type: `Number`  
Default value: `300`

Number in milliseconds for how long should browser debounce scroll (and resize)
events for that image collection. Valid only for postponed images.

## Global methods

#### `$.KistPostimg.fetchAllImages`

Fetch images for every created instance of Kist Postimg plugin. Useful when you
do lots of layout reflowing and want to check and fetch every image collection.

## Caveats

For postponed images to load properly (only visible in viewport), some dimension 
(height) needs to be set for them, otherwise browser will try to download every
image in collection.
