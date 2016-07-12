// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-05-15 using
// generator-karma 1.0.0

module.exports = function(config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // base path, that will be used to resolve files and exclude
        basePath: '.',

        // testing framework to use (jasmine/mocha/qunit/...)
        // as well as any additional frameworks (requirejs/chai/sinon/...)
        frameworks: [
            "jasmine",
            "browserify",
        ],

        // list of files / patterns to load in the browser
        files: [
            "test/**/*.js"
        ],

        // list of files / patterns to exclude
        exclude: [
            "test/coverage/*"
        ],

        // web server port
        port: 8080,
        // Start these browsers, currently available:
        // - Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), PhantomJS, IE (only Windows)
        browsers: [
            "Chrome"
        ],
        reporters: ['coverage', 'coveralls', 'mocha'],
        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_DISABLE,
        preprocessors: {
            'src/**/*.js': ['browserify', 'coverage'],
            'test/*.test.js': ['browserify']
        },
        coverageReporter: {
            reporters: [{ type: 'text' }, {
                type: 'html',
                dir: 'test/coverage',
                subdir: 'html'
            }, {
                type: 'lcovonly',
                dir: 'test/coverage',
                subdir: 'lcov'
            }]
        },

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        browserify: {
            debug: true,
            transform: ['babelify', 'browserify-istanbul']
        }

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
});
};