'use strict';

var CesiumCore = require('cesium-core-experimental');
var WebGLConstants = CesiumCore.WebGLConstants;

/**
 * @private
 */
var BufferUsage = {
    STREAM_DRAW : WebGLConstants.STREAM_DRAW,
    STATIC_DRAW : WebGLConstants.STATIC_DRAW,
    DYNAMIC_DRAW : WebGLConstants.DYNAMIC_DRAW,

    validate : function(bufferUsage) {
        return ((bufferUsage === BufferUsage.STREAM_DRAW) ||
                (bufferUsage === BufferUsage.STATIC_DRAW) ||
                (bufferUsage === BufferUsage.DYNAMIC_DRAW));
    }
};

module.exports = Object.freeze(BufferUsage);

