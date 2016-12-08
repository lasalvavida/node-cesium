'use strict';
var Promise = require('bluebird');
var fs = require('fs-extra');
var glob = require('glob');
var gulp = require('gulp');
var path = require('path');

var fsCopy = Promise.promisify(fs.copy);
var fsRemove = Promise.promisify(fs.remove);
var fsReadFile = Promise.promisify(fs.readFile);
var fsOutputFile = Promise.promisify(fs.outputFile)
var globAsync = Promise.promisify(glob);

gulp.task('copy-core', function(done) {
    fsCopy('./cesium/Source/Core', './modules/Core/lib').then(done);
});

function generateIndexString(publicModules) {
    var indexString = 'module.exports = {\n';
    var first = true;
    for (var publicModuleName in publicModules) {
        if (publicModules.hasOwnProperty(publicModuleName)) {
            var publicModulePath = publicModules[publicModuleName];
            if (!first) {
                indexString += ',\n';
            }
            indexString += '    ' + publicModuleName + ' : require(\'./' + publicModulePath + '\')';
            first = false;
        }
    }
    indexString += '\n};\n';
    return indexString;
}

gulp.task('post-process-core', function(done) {
    globAsync('./modules/Core/lib/*.js')
        .then(function(files) {
            var publicModules = {};
            return Promise.map(files, function(file) {
                return fsReadFile(file)
                    .then(function(data) {
                        var fileContents = data.toString();
                        // As per our Node style guide, delete duplicate newlines
                        fileContents = fileContents.replace(/\r\n/g, '\n');
                        fileContents = fileContents.replace(/\n{2,}/g, '\n\n');
                        // We can remove the global define tag for jsHint since we don't use define anymore
                        fileContents = fileContents.replace(/\/\*global define\*\/(\s*)/, '');
                        // Replace ThirdParty `when` usage with npm `bluebird`
                        fileContents = fileContents.replace('\'../ThirdParty/when\'', '\'bluebird\'');
                        fileContents = fileContents.replace(/(var when)/g, 'var Promise');
                        fileContents = fileContents.replace(/(when\.)/g, 'Promise.');
                        fileContents = fileContents.replace(/\.otherwise/g, '.catch');
                        fileContents = fileContents.replace(/when\((.*?)\,\s*function\(result\)\s*\{\n((.|\s)*?)return((.|\s)*?);/g, 'new Promise(function(resolve) {\n$2resolve($1);');
                        // Replace ThirdParty `mersenne-twister` usage with npm `mersenne-twister`
                        fileContents = fileContents.replace('\'../ThirdParty/mersenne-twister\'', '\'mersenne-twister\'');
                        // Replace ThirdParty `Uri` usage with npm 'urijs'
                        fileContents = fileContents.replace('\'../ThirdParty/Uri\'', '\'urijs\'');
                        fileContents = fileContents.replace(/((Uri|url|uri).*?).resolve\((.*)\)/g, '$1.relativeTo($2)');
                        fileContents = fileContents.replace(/((Uri|url|uri).*?).normalize/g, '$1.normalizeQuery');
                        fileContents = fileContents.replace(/((Uri|url|uri).*?).authority/g, '$1.authority()');
                        fileContents = fileContents.replace(/((Uri|url|uri).*?).scheme/g, '$1.protocol()');
                        // Replace ThirdParty `Tween` usage with npm `tween.js`
                        fileContents = fileContents.replace('\'../ThirdParty/Tween\'', '\'tween.js\'');
                        // Replace ThirdParty `earcut2.1.1` usage with npm `earcut`
                        fileContents = fileContents.replace('\'../ThirdParty/earcut-2.1.1\'', '\'earcut\'');
                        // Replace ThirdParty `sprintf` usage with npm `sprintf-js`
                        fileContents = fileContents.replace('\'../ThirdParty/sprintf\');', '\'sprintf-js\').sprintf;');
                        // Replace ThirdParty `measureText` with `context2D.measureText`
                        fileContents = fileContents.replace('var measureText = require(\'../ThirdParty/measureText\');\n', '');
                        fileContents = fileContents.replace(/measureText\((.|\s)*?, (.*?), (.|\s)*?\)/g, 'context2D.measureText($2)');
                        // Delete external require usage
                        fileContents = fileContents.replace('var require = require(\'..\\require\');\n', '');
                        // If the first header style comment contains @private, don't make it public
                        var headerMatches = fileContents.match(/\/\*((.|\s)*?)\*\//g);
                        if (headerMatches.length > 0) {
                            var header = headerMatches[0];
                            if (header.indexOf('@private') < 0) {
                                var filePath = file.substring(file.indexOf('lib'));
                                var moduleName = filePath.substring(filePath.indexOf('/') + 1).slice(0, -3);
                                publicModules[moduleName] = filePath;
                            }
                        }
                        return fsOutputFile(file, new Buffer(fileContents));
                    });
                })
                .then(function() {
                    return fsOutputFile('./Modules/Core/index.js', generateIndexString(publicModules));
                });
        })
        .then(function() {
            done();
        });
});

gulp.task('copy-renderer', function(done) {
    fsCopy('./cesium/Source/Renderer', './modules/Renderer/lib').then(done);
});

gulp.task('post-process-renderer', function(done) {
    globAsync('./modules/Renderer/lib/*.js')
        .then(function(files) {
            var publicModules = {};
            return Promise.map(files, function(file) {
                return fsReadFile(file)
                    .then(function(data) {
                        console.log(file);
                        var fileContents = data.toString();
                        // As per our Node style guide, delete duplicate newlines
                        fileContents = fileContents.replace(/\r\n/g, '\n');
                        fileContents = fileContents.replace(/\n{2,}/g, '\n\n');
                        // We can remove the global define tag for jsHint since we don't use define anymore
                        fileContents = fileContents.replace(/\/\*global define\*\/(\s*)/, '');
                        // Require cesium-core
                        fileContents = fileContents.replace('\'use strict\';\n\n', '\'use strict\';\n\nvar CesiumCore = require(\'cesium-core\');\n');
                        fileContents = fileContents.replace(/require\('\.\.\/Core\/(.*?)'\);/g, 'CesiumCore.$1;');
                        // This module itself is private, so just expose everything
                        var filePath = file.substring(file.indexOf('lib'));
                        var moduleName = filePath.substring(filePath.indexOf('/') + 1).slice(0, -3);
                        publicModules[moduleName] = filePath;
                        return fsOutputFile(file, new Buffer(fileContents));
                    });
            })
                .then(function() {
                    return fsOutputFile('./Modules/Renderer/index.js', generateIndexString(publicModules));
                });
        })
        .then(function() {
            done();
        });
});