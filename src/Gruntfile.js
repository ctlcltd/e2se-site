const path = require('path');
const liquidjsTask = require('./grunt/liquidjsTask.js');

module.exports = function(grunt) {

  const DIST_HELP_BASE_DEST = path.normalize(grunt.option('dest') || '../out');
  const REMOTE_HELP_BASE_URL = grunt.option('remote-help-url') || 'https://e2sateditor.com/help/';
  const REMOTE_ORIGIN = grunt.option('remote-origin') || 'http://localhost';
  const DEPLOY = grunt.option('deploy') && true || false;

  grunt.registerMultiTask('liquid', liquidjsTask);

  grunt.initConfig({
    watch: {
      site: {
        files: ['site/liquid/*.liquid', 'site/js/*.js', 'scss/*.scss'],
        tasks: ['liquid:site', 'concat:site', 'sass:site'],
        options: {
          spawn: false
        }
      },
      help: {
        files: ['help/liquid/*.liquid', 'scss/*.scss', 'help/scss/*.scss'],
        tasks: ['liquid:help', 'sass:help'],
        options: {
          spawn: false
        }
      },
      translate: {
        files: ['translate/liquid/*.liquid'],
        tasks: ['liquid:translate'],
        options: {
          spawn: false
        }
      }
    },
    copy: {
      site: {
        files: [
          {src: 'img/*', dest: '../public/'},
          {src: 'favicon/favicon.ico', dest: '../public/favicon.ico'}
        ]
      },
      translate: {
        files: [
          {expand: true, flatten: true, src: '../translate/ts/*', dest: '../public/translate/sources/'},
          {expand: true, flatten: true, src: '../translate/po/*', dest: '../public/translate/sources/'},
        ]
      },
    },
    liquid: {
      site: {
        options: {
          globals: {
            deploy: DEPLOY,
            origin: REMOTE_ORIGIN
          },
          data: {
            site_privacy_rev: new Date('2026-02-24'),
            software_privacy_rev: new Date('2026-01-05'),
            software_licenses_rev: new Date('2026-01-05')
          }
        },
        src: ['site/liquid/*.liquid'],
        dest: '../public'
      },
      help: {
        options: {
          globals: {
            deploy: DEPLOY,
            origin: REMOTE_ORIGIN,
            helpBaseUrl: REMOTE_HELP_BASE_URL + (/\/$/.test(REMOTE_HELP_BASE_URL) ? '' : '/'),
            toc: grunt.file.readJSON('help/toc.json')
          },
          data: {
            help_rev: new Date()
          }
        },
        src: ['help/liquid/*.liquid'],
        dest: '../public/help'
      },
      translate: {
        options: {
          globals: {
            deploy: DEPLOY,
            origin: REMOTE_ORIGIN,
            languages: grunt.file.readJSON('translate/languages.json'),
            sources: grunt.file.readJSON('../translate/sources.json')
          },
          data: {
            translate_sources_ver: '1.8.1'
          }
        },
        src: ['translate/liquid/*.liquid'],
        dest: '../public/translate'
      },
      dist_help: {
        options: {
          root: DIST_HELP_BASE_DEST + '/temp_files',
          globals: {
            deploy: false,
            distributable: true,
            origin: REMOTE_ORIGIN,
            helpBaseUrl: REMOTE_HELP_BASE_URL + (/\/$/.test(REMOTE_HELP_BASE_URL) ? '' : '/'),
            stylesheet: path.relative('help/liquid', DIST_HELP_BASE_DEST + '/temp_files/style.min.css'),
            script: path.relative('help/liquid', DIST_HELP_BASE_DEST + '/temp_files/script.min.js'),
            toc: {...grunt.file.readJSON('help/toc.json'), ...grunt.file.readJSON('help/toc-dist.json')}
          },
          data: {
            help_rev: new Date()
          }
        },
        src: ['help/liquid/*.liquid'],
        dest: DIST_HELP_BASE_DEST
      }
    },
    concat: {
      site: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('site/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n})();\n'
        },
        src: ['site/js/index.js'],
        dest: '../public/script.js'
      },
      dist_help: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('help/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n})();\n'
        },
        src: ['help/js/help.js'],
        dest: DIST_HELP_BASE_DEST + '/temp_files/script.js'
      }
    },
    terser: {
      options: {
        compress: false,
        mangle: true,
        sourceMap: false
      },
      site: {
        files: {
          '../public/script.min.js': ['../public/script.js']
        }
      },
      dist_help: {
        options: {
          format: {
            comments: false
          }
        },
        files: [
          {src: DIST_HELP_BASE_DEST + '/temp_files/script.js', dest: DIST_HELP_BASE_DEST + '/temp_files/script.min.js'}
        ]
      }
    },
    sass: {
      options: {
        noSourceMap: true
      },
      bunch: {
        files: {
          './scss/bunch.css': 'scss/index.scss'
        }
      },
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
      dist_help: {
        files: [
          {src: 'help/scss/dist.scss', dest: DIST_HELP_BASE_DEST + '/temp_files/style.css'}
        ]
      }
    },
    cssmin: {
      options: {
        compatibility: '-properties.colors,-properties.merging',
        sourceMap: false
      },
      site: {
        files: {
          '../public/style.min.css': ['../public/style.css']
        }
      },
      help: {
        files: {
          '../public/help.min.css': ['../public/help.css']
        }
      },
      dist_help: {
        options: {
          level: {
            1: {specialComments: false}
          }
        },
        files: [
          {src: DIST_HELP_BASE_DEST + '/temp_files/style.css', dest: DIST_HELP_BASE_DEST + '/temp_files/style.min.css'}
        ]
      }
    },
    clean: {
      dist_help: {
        options: {force: true},
        src: [DIST_HELP_BASE_DEST + '/temp_files/']
      }
    }
  });

  grunt.event.on('watch', function(action, filepath, target) {
    if (/^_/.test(path.basename(filepath))) {
      return;
    }

    grunt.config('liquid.site.src', filepath);
    grunt.config('liquid.help.src', filepath);
    grunt.config('liquid.translate.src', filepath);
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-terser');

  // site tasks
  grunt.registerTask('build:site', ['liquid:site', 'concat:site', 'terser:site', 'sass:site', 'cssmin:site']);
  grunt.registerTask('watch:site', ['build:site', 'watch:site']);

  // help tasks
  grunt.registerTask('build:help', ['liquid:help', 'sass:help', 'cssmin:help']);
  grunt.registerTask('watch:help', ['build:help', 'watch:help']);
  grunt.registerTask('dist:help', ['concat:dist_help', 'terser:dist_help', 'sass:dist_help', 'cssmin:dist_help', 'liquid:dist_help', 'clean:dist_help']);

  // translate tasks
  grunt.registerTask('build:translate', ['liquid:translate']);
  grunt.registerTask('watch:translate', ['build:translate', 'watch:translate']);

  grunt.registerTask('build:bunch', ['sass:bunch']);
  grunt.registerTask('default', ['build:site', 'build:help', 'build:translate']);

};
