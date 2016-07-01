(function () {
    'use strict';


    var del = require('del');
    var gulp = require('gulp');
    var angularTranslate = require('./index');

    function extractTranslations() {
        return gulp.src('fixtures/**/*.html')
            .pipe(angularTranslate({
                lang: ['fr_FR', 'en_CA'],
                // suffix: '.json'
                //prefix: 'project_',
                //defaultLang: 'en_CA',
                // interpolation: {
                //     startDelimiter: '[[',
                //     endDelimiter: ']]'
                // }
                // namespace: true,
                // stringifyOptions: true,
                // nullEmpty: true,
                subfolder: "i18n"

            }))
            .pipe(gulp.dest('./'));
    }

    gulp.task('default', extractTranslations);


    gulp.task('delete', function () {

        del(['./fixtures/**/*.json']);


    });
})();
