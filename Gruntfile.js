module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        datetime: Date.now(),
        banner: '/*!\n' +
        'Package: <%= pkg.title || pkg.name %> (<%= pkg.homepage %>)\n' + 
        'Version: <%= pkg.version %>\n' +
        'Last updated: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Author: <%= pkg.author.name %>;\n' +
        '* Website: <%= pkg.author.website %> */\n',
        jqueryCheck: 'if (!jQuery) { throw new Error(\"Bootstrap requires jQuery\") }\n\n',

        // Task Configuration
        clean: {
            dist: ['dist']
        },

        concat: {
            options: {
                banner: '<%= banner %><%= jqueryCheck %>',
                stripBanners: false
            },
            plugin: {
                src: ['js/<%= pkg.name %>.js'],
                dest: 'dist/js/<%= pkg.name %>.js'
            }
        },

        jshint: {
            options: {
                jshintrc: 'js/.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            docs: {
                src: ['assets/js/application.js']
            },
            src: {
                src: ['js/*.js']
            },
            test: {
                src: ['js/tests/unit/*.js']
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            plugin: {
                src: 'js/<%= pkg.name %>.js',
                dest: 'dist/js/<%= pkg.name %>.min.js'
            }
        },

        compass: {
            dev: {
                options: {
                    config: 'compass/config.rb',
                    environment: 'development'
                }
            },
            dist: {
                options: {
                    config: 'compass/config.rb',
                    environment: 'production'
                }
            }
        },

        qunit: {
            options: {
                inject: 'js/tests/unit/phantom.js'
            },
            files: ['js/tests/*.html']
        },

        connect: {
            server: {
                options: {
                    port: 3000,
                    base: '.'
                }
            }
        },

        watch: {
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'concat', 'uglify']
            },
            docs: {
                files: '<%= jshint.docs.src %>',
                tasks: ['jshint:docs']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            },
            compass: {
                files: ['compass/sass/*'],
                tasks: ['compass:dev']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');

    // Test task.
    grunt.registerTask('test', ['jshint', 'qunit']);

    // JS distribution task.
    grunt.registerTask('dist-js', ['uglify']);

    // CSS distribution task.
    grunt.registerTask('dist-css', ['compass:dist']);

    // Full distribution task.
    grunt.registerTask('dist', ['clean', 'dist-css', 'dist-js']);

    // Default task.
    grunt.registerTask('default', ['test', 'dist']);
};