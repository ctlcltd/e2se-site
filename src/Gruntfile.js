const path = require('path');
const { Liquid } = require('liquidjs');

module.exports = function(grunt) {

  grunt.registerMultiTask('liquid', async function() {
    const done = this.async();
    var options = this.options({
      globals: {},
      data: {}
    });

    const filedest = this.files[0].dest;
    let files = [];

    if (! grunt.file.isDir(filedest)) {
      return;
    }
    this.files.forEach(function(file) {
      files = file.src.filter(function(filepath) {
        if (! grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        }
        if (grunt.file.isDir(filepath)) {
          return false;
        }
        if (/^_/.test(path.basename(filepath))) {
          return false;
        }
        return true;
      });
    });

    const engine = new Liquid({
      root: files.map(function(filepath, i) {
        return path.dirname(filepath);
      }).filter(function(v, i, a) {
        return a.indexOf(v) === i; 
      })
    });

    await files.map(async function(filepath, i) {
      const fname = path.basename(filepath, '.liquid');
      const filename = path.format({dir: filedest, name: fname, ext: 'html'});
      const src = grunt.file.read(filepath);
      var dst = '';
      await engine
        .parseAndRender(src, options.data, {globals: {templateName: fname, ...options.globals}})
        .then(function(output) {
          dst = output;
        });

      grunt.file.write(filename, dst);
    });

    done();
  });

  grunt.initConfig({
    watch: {
      site: {
        files: ['site/liquid/*.liquid', 'site/js/*.js', 'scss/*.scss', 'translate/scss/*.scss'],
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
        files: ['translate/liquid/*.liquid', 'scss/*.scss', 'translate/scss/*.scss', 'translate/js/*.js'],
        tasks: ['liquid:translate', 'sass:translate', 'concat:translate'],
        options: {
          spawn: false
        }
      },
      backend: {
        files: ['backend/liquid/*.liquid', 'backend/js/*.js', 'scss/*.scss', 'backend/scss/*.scss'],
        tasks: ['liquid:backend', 'concat:backend', 'sass:backend'],
        options: {
          spawn: false
        }
      }
    },
    copy: {
      public: {
        files: [
          {src: 'img/*', dest: '../public/'},
          {src: 'favicon/favicon.ico', dest: '../public/favicon.ico'}
        ]
      }
    },
    liquid: {
      site: {
        options: {
          globals: {
            deploy: false
          },
          data: {
            privacy_rev: new Date('2023-09-15')
          }
        },
        src: ['site/liquid/*.liquid'],
        dest: '../public'
      },
      help: {
        options: {
          globals: {
            deploy: false,
            toc: grunt.file.readJSON('help/toc.json')
          }
        },
        src: ['help/liquid/*.liquid'],
        dest: '../public/help'
      },
      translate: {
        options: {
          globals: {
            deploy: false
          }
        },
        src: ['translate/liquid/*.liquid'],
        dest: '../public/translate'
      },
      backend: {
        options: {
          globals: {
            deploy: false
          }
        },
        src: ['backend/liquid/*.liquid'],
        dest: '../public/backend'
      }
    },
    concat: {
      site: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('site/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n});\n'
        },
        src: ['site/js/index.js'],
        dest: '../public/script.js'
      },
      translate: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('translate/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n});\n'
        },
        src: ['translate/js/config.js', 'translate/js/main.js', 'translate/js/edit_translate.js', 'translate/js/add_language.js', 'translate/js/send_translation.js', 'translate/js/resume_translation.js', 'translate/js/misc.js', 'translate/js/api_request.js', 'translate/js/source_request.js', 'translate/js/route.js', 'translate/js/init.js'],
        dest: '../public/translate/script.js'
      },
      backend: {
        options: {
          stripBanners: true,
          banner: grunt.file.read('backend/js/_banner.js') + '\n(function() {\n\n',
          footer: '\n});\n'
        },
        src: ['backend/js/config.js', 'backend/js/main.js', 'backend/js/list.js', 'backend/js/edit.js', 'backend/js/service.js', 'backend/js/signin.js', 'backend/js/signout.js', 'backend/js/api_request.js', 'backend/js/api_test.js', 'backend/js/nav.js', 'backend/js/route.js', 'backend/js/init.js'],
        dest: '../public/backend/script.js'
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
      translate: {
        files: {
          '../public/translate/script.min.js': ['../public/translate/script.js']
        }
      },
      backend: {
        files: {
          '../public/backend/script.min.js': ['../public/backend/script.js']
        }
      }
    },
    sass: {
      options: {
        noSourceMap: true
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
      translate: {
        files: {
          '../public/translate/style.min.css': ['../public/translate/style.css']
        }
      },
      backend: {
        files: {
          '../public/backend/style.min.css': ['../public/backend/style.css']
        }
      }
    }
  });

  grunt.event.on('watch', function(action, filepath, target) {
    if (! /^_/.test(path.basename(filepath))) {
      return;
    }

    grunt.config('liquid.site.src', filepath);
    grunt.config('liquid.help.src', filepath);
    grunt.config('liquid.translate.src', filepath);
    grunt.config('liquid.backend.src', filepath);
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-terser');

  // site tasks
  grunt.registerTask('build.site', ['liquid:site', 'concat:site', 'terser:site', 'sass:site', 'cssmin:site']);
  grunt.registerTask('watch.site', ['build.site', 'watch:site']);

  // help tasks
  grunt.registerTask('build.help', ['liquid:help', 'sass:help', 'cssmin:help']);
  grunt.registerTask('watch.help', ['build.help', 'watch:help']);
  grunt.registerTask('dist.help', []);

  // translate tasks
  grunt.registerTask('build.translate', ['liquid:translate', 'concat:translate', 'terser:translate', 'sass:translate', 'cssmin:translate']);
  grunt.registerTask('watch.translate', ['build.translate', 'watch:translate']);

  // backend tasks
  grunt.registerTask('build.backend', ['liquid:backend', 'concat:backend', 'terser:backend', 'sass:backend', 'cssmin:backend']);
  grunt.registerTask('watch.backend', ['build.backend', 'watch:backend']);

  grunt.registerTask('default', ['build.site', 'build.help', 'build.translate', 'build.backend']);

};
