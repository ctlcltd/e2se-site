module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      site: {
        files: ['site/liquid/*.liquid', 'site/js/*.js', 'scss/*.scss', 'translate/scss/*.scss'],
        tasks: ['concat:site', 'sass:site']
      },
      help: {
        files: ['help/liquid/*.liquid', 'scss/*.scss', 'help/scss/*.scss', 'translate/js/*.js'],
        tasks: ['sass:help', 'concat:translate']
      },
      translate: {
        files: ['scss/*.scss', 'translate/scss/*.scss'],
        tasks: ['sass:translate']
      },
      backend: {
        files: ['backend/js/*.js', 'scss/*.scss', 'backend/scss/*.scss'],
        tasks: ['concat:backend', 'sass:backend']
      }
    },
    concat: {
      site: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('site/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n});'
        },
        src: ['site/js/index.js'],
        dest: '../public/script.js'
      },
      translate: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('translate/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n});'
        },
        src: ['translate/js/config.js', 'translate/js/main.js', 'translate/js/edit_translate.js', 'translate/js/add_language.js', 'translate/js/send_translation.js', 'translate/js/resume_translation.js', 'translate/js/misc.js', 'translate/js/api_request.js', 'translate/js/source_request.js', 'translate/js/route.js', 'translate/js/init.js'],
        dest: '../public/translate/script.js'
      },
      backend: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('backend/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n});'
        },
        src: ['backend/js/config.js', 'backend/js/main.js', 'backend/js/list.js', 'backend/js/edit.js', 'backend/js/service.js', 'backend/js/signin.js', 'backend/js/signout.js', 'backend/js/api_request.js', 'backend/js/api_test.js', 'backend/js/nav.js', 'backend/js/route.js', 'backend/js/init.js'],
        dest: '../public/backend/script.js'
      }
    },
    sass: {
      site: {
        files: {
          '../public/style.css': 'site/scss/index.scss'
        }
      },
      help: {
        files: {
          '../public/help.css': 'help/scss/index.scss'
        }
      },
      translate: {
        files: {
          '../public/translate/style.css': 'translate/scss/index.scss'
        }
      },
      backend: {
        files: {
          '../public/backend/style.css': 'backend/scss/index.scss'
        }
      }
    },
    terser: {
      site: {
        files: {
          '../public/script.min.js': ['<%= concat.site.dest %>']
        }
      },
      translate: {
        files: {
          '../public/translate/script.min.js': ['<%= concat.translate.dest %>']
        }
      },
      backend: {
        files: {
          '../public/backend/script.min.js': ['<%= concat.backend.dest %>']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-terser');

  // site tasks
  grunt.registerTask('build.site', ['concat:site', 'terser:site', 'sass:site']);
  grunt.registerTask('watch.site', ['build.site', 'watch:site']);

  // help tasks
  grunt.registerTask('build.help', ['sass:help']);
  grunt.registerTask('watch.help', ['build.help', 'watch:help']);
  grunt.registerTask('dist.help', []);

  // translate tasks
  grunt.registerTask('build.translate', ['concat:translate', 'terser:translate', 'sass:translate']);
  grunt.registerTask('watch.translate', ['build.translate', 'watch:translate']);

  // backend tasks
  grunt.registerTask('build.backend', ['concat:backend', 'terser:backend', 'sass:backend']);
  grunt.registerTask('watch.backend', ['build.backend', 'watch:backend']);

  grunt.registerTask('default', ['build.site', 'build.translate', 'build.backend']);

};
