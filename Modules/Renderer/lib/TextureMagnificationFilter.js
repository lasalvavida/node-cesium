'use strict';

var CesiumCore = require('cesium-core-experimental');
var WebGLConstants = CesiumCore.WebGLConstants;

/**
 * @private
 */
var TextureMagnificationFilter = {
    NEAREST : WebGLConstants.NEAREST,
    LINEAR : WebGLConstants.LINEAR,

    validate : function(textureMagnificationFilter) {
        return ((textureMagnificationFilter === TextureMagnificationFilter.NEAREST) ||
                (textureMagnificationFilter === TextureMagnificationFilter.LINEAR));
    }
};

module.exports = Object.freeze(TextureMagnificationFilter);

