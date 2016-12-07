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

gulp.task('post-process-core', function(done) {
    globAsync('./modules/Core/lib/*.js')
        .then(function(files) {
            var publicModules = {};
            return Promise.map(files, function(file) {
                return fsReadFile(file)
                    .then(function(data) {
                        var fileContents = data.toString();
                        // We can remove the global define tag for jsHint since we don't use define anymore
                        fileContents = fileContents.replace(/\/\*global define\*\/(\s*)/, '');
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
                    return fsOutputFile('./Modules/Core/index.js', indexString);
                });
        })
        .then(function() {
            done();
        });
});
