'use strict';

var CesiumCore = require('cesium-core-experimental');
var WebGLConstants = CesiumCore.WebGLConstants;

/**
 * @private
 */
var MipmapHint = {
    DONT_CARE : WebGLConstants.DONT_CARE,
    FASTEST : WebGLConstants.FASTEST,
    NICEST : WebGLConstants.NICEST,

    validate : function(mipmapHint) {
        return ((mipmapHint === MipmapHint.DONT_CARE) ||
                (mipmapHint === MipmapHint.FASTEST) ||
                (mipmapHint === MipmapHint.NICEST));
    }
};

module.exports = Object.freeze(MipmapHint);

