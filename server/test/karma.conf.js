// Karma configuration
// Generated on Sun Feb 09 2014 16:22:05 GMT+0000 (GMT Standard Time)

module.exports = function(config) {
      config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '..',


        // frameworks to use
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            "src/lib/angular/angular.min.js",
            "src/lib/angular-route/angular-route.min.js",
            "src/lib/angular-touch/angular-touch.min.js",
            "src/lib/angular-bootstrap/ui-bootstrap-tpls.min.js",
            'src/lib/firebase/firebase.js',
            'src/lib/firebase-simple-login/firebase-simple-login.js',
            'src/lib/angular-mocks/angular-mocks.js',
            'src/app.js',
            'test/**/*.js'
        ],


        // list of files to exclude
        exclude: [
           'test/karma.conf.js'
        ],


        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['Chrome'],


        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
      });
};
