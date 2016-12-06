'use strict';
var Promise = require('bluebird');
var fs = require('fs-extra');
var glob = require('glob');
var gulp = require('gulp');
var path = require('path');

var fsCopy = Promise.promisify(fs.copy);
var fsRemove = Promise.promisify(fs.remove);
var fsWriteFile = Promise.promisify(fs.writeFile)
var globAsync = Promise.promisify(glob);

gulp.task('copy-core', function(done) {
    fsCopy('./cesium/Source/Core', './modules/Core/lib').then(done);
});

gulp.task('gen-core', function(done) {
    var indexFile = './modules/Core/index.js';
    globAsync('./modules/Core/lib/*.js')
        .then(function(files) {
            var indexString = 'module.exports = {\n';
            var filesLength = files.length;
            for (var i = 0; i < filesLength; i++) {
                var file = files[i];
                file = file.substring(file.indexOf('lib'));
                var moduleName = file.substring(file.indexOf('/') + 1).slice(0, -3);
                indexString += '    ' + moduleName + ' : require(\'./' + file + '\'),\n';
            }
            indexString += '};\n';
            return fsWriteFile(indexFile, indexString);
        })
        .then(done);
});
