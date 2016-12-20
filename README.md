# node-cesium-experimental
Cesium libraries in CommonJS format for use with Node.js

## !!! Experimental !!!
This is not an official release of [Cesium](https://github.com/AnalyticalGraphicsInc/cesium) and is not guaranteed to be stable.


## What is this for?
This library separates Cesium into separate npm modules for node. This
means that if you only use the Core library of Cesium, you can get the files
you need without including all of Cesium.

### Browserify and Webpack

Cesium uses the AMD format for its dependencies in the main release, so
npm modules load it using the
[requirejs](https://www.npmjs.com/package/requirejs)
module for Node, since Node uses the CommonJS format and doesn't support AMD natively.
This can make it difficult to bundle npm modules that depend on Cesium.

This library uses
[browserify-ftw](https://github.com/thlorenz/browserify-ftw)
to put Cesium in a format that node understands and that can be bundled easily.

## Usage
### Get cesium-core-experimental
```
npm install cesium-core-experimental --save
```

```javascript
var CesiumCore = require('cesium-core-experimental');
var defaultValue = CesiumCore.defaultValue;
var defined = CesiumCore.defined;
```

See the main
[Cesium](https://github.com/AnalyticalGraphicsInc/cesium)
release for additional usage and licensing information.

### Build cesium-core-experimental
```
// Get Cesium
git submodule update --init
// Build Cesium Core
npm install
npm run build-core
```
