module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            app: {
                src: ['dist']
            }
        },
        copy: {
            app: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['css/*.css','css/fonts/*.*','images/*.*', 'lib/*.*', 'views/**/*.html', '*.html', 'js/**/*.js'],
                        dest: 'dist/'
                    }
                ]
            }
        },
        replace: {
            app: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {
                        from: '@@DEVELOPMENT',
                        to: '<%= pkg.version %>'
                    },
                    {
                        from: '@@TIMESTAMP',
                        to: '<%= new Date().getTime() %>'
                    }
                ]
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                commit: false,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'], // '-a' for all files
                createTag: false,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        },
        exec: {
            app: {
                cmd: 'firebase deploy'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('default', ['clean','bump','copy','replace', 'exec']);
};