const path = require('path');
const { URL } = require('url');
const grunt = require('grunt');
const { Liquid } = require('liquidjs');

function filter_asset(src, deploy) {
  return deploy ? (/^\//.test(src) ? '' : '/') + src.replace(/(\.\w+)$/, '.min$1') : src;
}

const tag_canonicalUrl = {
  render: function(ctx) {
    const url_origin = ctx.globals.origin;
    const url_base = ctx.globals.basePath == 'site' ? '' : ctx.globals.basePath + '/';
    const url_path = ctx.globals.templateName == 'index' ? '' : ctx.globals.templateName + '.html';
    return new URL(url_base + url_path, url_origin).toString();
  }
};

function liquidjsTask() {
  var options = this.options({
    root: [],
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
      }).concat(options.root)
  });
  engine.registerFilter('asset', filter_asset);
  engine.registerTag('canonicalUrl', tag_canonicalUrl);

  let createdFiles = 0;

  files.map(function(filepath, i) {
    const basePath = path.dirname(path.dirname(filepath) + '..');
    const templateName = path.basename(filepath, '.liquid');
    const filename = path.format({dir: filedest, name: templateName, ext: '.html'});
    const src = grunt.file.read(filepath);
    const dst = engine.parseAndRenderSync(src, options.data, {
      globals: {templateName, basePath, ...options.globals}
    });

    grunt.file.write(filename, dst);

    grunt.log.verbose.writeln('File "' + path.basename(filename) + '" created.');
    createdFiles += 1;
  });

  if (createdFiles > 0) {
    grunt.log.ok(createdFiles + ' ' + grunt.util.pluralize(createdFiles, 'file/files') + ' created.');
  } else {
    grunt.log.warn('No files created.');
  }
}

module.exports = liquidjsTask;
