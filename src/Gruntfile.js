module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      site_liquid: {
        files: ['site/liquid/*.liquid'],
        tasks: []
      },
      site_js: {
        files: ['site/js/*.js'],
        tasks: ['concat:site']
      },
      site_sass: {
        files: ['scss/*.scss', 'translate/scss/*.scss'],
        tasks: ['sass:site']
      },
      help_liquid: {
        files: ['help/liquid/*.liquid'],
        tasks: []
      },
      help_sass: {
        files: ['scss/*.scss', 'help/scss/*.scss'],
        tasks: ['sass:help']
      },
      translate_js: {
        files: ['translate/js/*.js'],
        tasks: ['concat:translate_js']
      },
      translate_sass: {
        files: ['scss/*.scss', 'translate/scss/*.scss'],
        tasks: ['translate_build_sass']
      },
      backend_js: {
        files: ['backend/js/*.js'],
        tasks: ['backend_concat_js']
      },
      backend_sass: {
        files: ['scss/*.scss', 'backend/scss/*.scss'],
        tasks: ['translate_build_sass']
      }
    },
    concat: {
      site: {
        options: {
          stripBanners: true
        },
        dist: {
          src: ['site/js/*.js'],
          dest: '../public/script.js'
        }
      },
      translate: {
        options: {
          stripBanners: true
        },
        dist: {
          src: ['translate/js/*.js'],
          dest: '../public/translate/script.js'
        }
      },
      backend: {
        options: {
          stripBanners: true
        },
        dist: {
          src: ['backend/js/*.js'],
          dest: '../public/backend/script.js'
        }
      }
    },
    sass: {
      site: {
        dist: {
          files: {
            '../public/style.css': 'site/scss/index.scss'
          }
        }
      },
      translate: {
        dist: {
          files: {
            '../public/translate/style.css': 'translate/scss/index.scss'
          }
        }
      },
      backend: {
        dist: {
          files: {
            '../public/backend/style.css': 'backend/scss/index.scss'
          }
        }
      }
    },
    terser: {
      site: {
        files: {
          '../public/script.min.js': ['<%= concat:site.dist.dest %>']
        }
      },
      translate: {
        files: {
          '../public/translate/script.min.js': ['<%= concat:translate.dist.dest %>']
        }
      },
      backend: {
        files: {
          '../public/backend/script.min.js': ['<%= concat:backend.dist.dest %>']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-terser');

  // site tasks
  grunt.registerTask('build-site-liquid', []);
  grunt.registerTask('build-site-js', ['concat:site', 'terser:site']);
  grunt.registerTask('build-site-sass', ['sass:site']);
  grunt.registerTask('build-site', ['build-site-liquid', 'build-site-js', 'build-site-sass']);
  grunt.registerTask('watch-site-liquid', []);
  grunt.registerTask('watch-site-js', ['concat:site', 'watch:site_js', 'terser:site']);
  grunt.registerTask('watch-site-sass', ['sass:site', 'watch:site_sass']);
  grunt.registerTask('watch-site', ['site-watch-liquid', 'site-watch-js', 'site-watch-sass']);

  // help tasks
  grunt.registerTask('build-help-liquid', []);
  grunt.registerTask('build-help-sass', ['sass:site']);
  grunt.registerTask('build-site', ['build-help-liquid', 'build-help-js', 'build-help-sass']);
  grunt.registerTask('watch-help-liquid', []);
  grunt.registerTask('watch-help-sass', ['sass:site', 'watch:site_sass']);
  grunt.registerTask('watch-site', ['help-watch-liquid', 'help-watch-js', 'help-watch-sass']);
  grunt.registerTask('dist-help', []);

  // translate tasks
  grunt.registerTask('build-translate-js', ['concat:translate', 'terser:translate']);
  grunt.registerTask('build-translate-sass', ['sass:translate']);
  grunt.registerTask('build-translate-build', ['build-translate-js', 'build-translate-sass']);
  grunt.registerTask('watch-translate-js', ['concat:translate', 'watch:translate_js', 'terser:translate']);
  grunt.registerTask('watch-translate-sass', ['sass:translate', 'watch:translate_sass']);
  grunt.registerTask('watch-translate', ['watch-translate-js', 'watch-translate-sass']);

  // backend tasks
  grunt.registerTask('build-backend-js', ['concat:translate', 'terser:translate']);
  grunt.registerTask('build-backend-sass', ['sass:translate']);
  grunt.registerTask('build-backend-build', ['build-backend-js', 'build-backend-sass']);
  grunt.registerTask('watch-backend-js', ['concat:translate', 'watch:translate_js', 'terser:translate']);
  grunt.registerTask('watch-backend-sass', ['sass:translate', 'watch:translate_sass']);
  grunt.registerTask('watch-translate', ['watch-backend-js', 'watch-backend-sass']);

  grunt.registerTask('default', ['site-build', 'translate-build', 'backend-build']);

};
