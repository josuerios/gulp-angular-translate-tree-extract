'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var stringify = require('json-stable-stringify');
var through = require('through2');

/**
 * Interns
 */
var ExtractTranslations = require('./modules/extractTranslations');
var Helpers = require('./modules/helpers');
var MergeTranslations = require('./modules/mergeTranslations');
var Translations = require('./modules/translations');

/**
 * Constants
 */
var PLUGIN_NAME = 'gulp-angular-translate-module-extract';

/**
 * Angular Translate
 * @param  {object} options  AngularTranslate's options
 */
function angularTranslate(options) {
    options = options || {};

    /**
     * Check lang parameter.
     */
    if (!_.isArray(options.lang) || !options.lang.length) {
        throw new gutil.PluginError(PLUGIN_NAME,
            chalk.red('Param lang required'));
    }

    /**
     * Set all needed variables
     */
    var destinationPath = options.dest || './i18nextract',
        firstFile,
        prefix = options.prefix || '',
        results = {},
        suffix = options.suffix || '.json',
        subfolder = options.subfolder || '';


    /**
     * Gulp Angular Translate start processing
     */
    return through.obj(function (file, enc, callback) {


        var self = this;
        if (file.isStream()) {
            throw new gutil.PluginError(PLUGIN_NAME,
                chalk.red('Straming not supported.'));
        }


        if (!firstFile) {
            firstFile = file;
        }

        if (file.isNull()) {
            // Return empty file.
            return callback(null, file);
        }

        if (file.isBuffer()) {
            /**
             * Start extraction of translations
             */
            var content = file.contents.toString();
            var extract = new ExtractTranslations(options, content);
            var processed = extract.process();


            var filePath = file.path.replace(file.cwd, '.');

            if (Object.keys(processed).length > 0) {

                var splitted = filePath.split("/");
                splitted.pop();


                var relative = path.join(splitted.join('/'),subfolder);

                if (!results[relative]) {
                    results[relative] = {};
                }

                _.extend(results[relative], processed);
            }
        }

        callback();
    }, function (callback) {
        var self = this;

        if (!firstFile) {
            callback();
            return;
        }


        for (var i in results) {

            var transKeys = results[i]
            var folderPath = i;
            var translations = {};

            options.dest = folderPath;
            var merge = new MergeTranslations(options);

            options.lang.forEach(function (lang) {
                translations = merge.process(transKeys, lang);
                self.push(new gutil.File({
                    path: path.join(folderPath, prefix + lang + suffix),
                    contents: new Buffer(Helpers.customStringify(translations, options.stringifyOptions))
                }));
            });


        }


        callback();
    });
}

module.exports = angularTranslate;
