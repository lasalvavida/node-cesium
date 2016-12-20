# cesium-renderer-experimental
Cesium Renderer libraries in CommonJS format for use with Node.js

## !!! Experimental !!!
This is not an official release of [Cesium](https://github.com/AnalyticalGraphicsInc/cesium) and is not guaranteed to be stable.

Note: The Cesium Renderer API is not a part of the Cesium public API, and as such may change at any time. 
Production code should instead use the higher-level Cesium Scene API.

## Usage
### Get cesium-renderer-experimental
```
npm install cesium-renderer-experimental --save
```

```javascript
var CesiumRenderer = require('cesium-renderer-experimental');
var Framebuffer = CesiumRenderer.Framebuffer;
var ShaderSource = CesiumRenderer.ShaderSource;
```

See the main
[Cesium](https://github.com/AnalyticalGraphicsInc/cesium)
release for additional usage and licensing information.
