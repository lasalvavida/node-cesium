# cesium-node
Cesium libraries in CommonJS format for use with Node.js

## What is this for?
This library separates Cesium into separate npm modules for node. This
means that if you only use the Core library of Cesium, you can get the files
you need without including all of Cesium.

## Usage
### Get cesium-core
```
npm install cesium-core --save
```

```javascript
var CesiumCore = require('cesium-core');
var defaultValue = CesiumCore.defaultValue;
var defined = CesiumCore.defined;
```

### Build cesium-core
```
// Get Cesium
git submodule update --init
// Build Cesium Core
npm install
npm run build-core
```

## Browserify and Webpack

Cesium uses the AMD format for its dependencies in the main release, so
npm modules load it using the
[requirejs](https://www.npmjs.com/package/requirejs)
module for Node, since Node uses the CommonJS format and doesn't support AMD natively.
This can make it difficult to bundle npm modules that depend on Cesium.

This library uses
[amd-to-common](https://github.com/Willyham/amd-to-common)
to put Cesium in a format that node understands and that can be bundled easily.
