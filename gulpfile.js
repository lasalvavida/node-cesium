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
                        // Replace ThirdParty `when` usage with npm `bluebird`
                        fileContents = fileContents.replace('\'../ThirdParty/when\'', '\'bluebird\'');
                        // Replace ThirdParty `mersenne-twister` usage with npm `mersenne-twister`
                        fileContents = fileContents.replace('\'../ThirdParty/mersenne-twister\'', '\'mersenne-twister\'');
                        // Replace ThirdParty `Uri` usage with node 'url'
                        fileContents = fileContents.replace('\'../ThirdParty/Uri\'', '\'url\'');
                        // Replace ThirdParty `Tween` usage with npm `tween`
                        fileContents = fileContents.replace('\'../ThirdParty/Tween\'', '\'tween\'');
                        // Replace ThirdParty `earcut2.1.1` usage with npm `earcut`
                        fileContents = fileContents.replace('\'../ThirdParty/earcut-2.1.1\'', '\'earcut\'');
                        // Replace ThirdParty `sprintf` usage with npm `sprintf-js`
                        fileContents = fileContents.replace('\'../ThirdParty/sprintf\');', '\'sprintf-js\').sprintf;');
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
