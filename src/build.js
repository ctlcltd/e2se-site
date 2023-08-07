const fs = require('fs');
const UglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');
const sass = require('sass');

const argv = process.argv;
const src = argv[2];
const dst = argv[2] != 'landing' ? argv[2] : '';
const options = fs.readFileSync('./' + src + '/build_options.jsx');

const dest = '../public';


class Build {

  constructor(options) {
    try {
      // /[{]+[^]+[}]+/.test(options.toString())
      if (typeof options === 'object' && options instanceof Buffer) {
        options = options.toString();
        options = options.replace(/\/\/([^\r\n]+)|(\/[\*]+)(=?[\w\W]+?)(\*\/)/g, '');
        options = options.replace(/([\s]+)([\s]+)|[\r\n\t]+/g, '');
        options = options.replace(/\,(=?(?=\}))/g, '');
        options = JSON.parse(options);
      }

      if (typeof options !== 'object') {
        throw 'options type';
      }

      this.options = Object.assign({}, options);
    } catch (err) {
      return this.error('constructor', err);
    }

    this.contents = {};

    if (this.options.projectName && typeof this.options.projectName === 'string') {
      this.options.projectName = this.options.projectName.toString();
    }
    if (this.options.contents && typeof this.options.contents === 'object') {
      this.contents = this.options.contents;
    }

    this.indexes = { js: {}, css: {} };
    this.blob = { js: [], css: [], scss: '' };
  }

  router() {
    const argv = process.argv;
    const type = argv[3] === 'watch' && argv[4] ? argv[4] : argv[3] !== 'watch' ? argv[3] : null;
    const watch = argv[3] === 'watch' ? true : false;
    const build = this.options.buildOnStart ? true : false;

    this.log();

    if (build) {
      if (! type || type === 'js') {
        this.build('js', './' + src + '/js');
      }
      /*if (! type || type === 'css') {
        this.build('css', './' + src + '/css');
      }*/
      if (! type || type === 'scss') {
        this.compile('scss', './' + src + '/scss');
      }
    }

    if (watch) {
      if (! type || type === 'js') {
        this.watch('js', './' + src + '/js');
      }
      /*if (! type || type === 'css') {
        this.watch('css', './' + src + '/css');
      }*/
      if (! type || type === 'scss') {
        this.watch('scss', './scss', './' + src + '/scss');
        this.watch('scss', './' + src + '/scss');
      }
    }
  }

  line(blob) {
    let line = '\r\n\r\n';

    if (typeof blob === 'object') {
      if (blob instanceof Array) {
        line = '\t';

        blob.forEach((key) => {
          line += key.padEnd(20) + '\t';
        });

        line += '\r\n';
      } else {
        Object.keys(blob).forEach((key) => {
          line += '\t\t' + key.padEnd(10) + '\t' + blob[key] + '\r\n';
        });
      }
    } else {
      line = '\t' + blob + '\r\n';
    }

    return line;
  }

  log(fromf, type, line) {
    fromf = fromf ? fromf : '';
    type = type ? type : '';
    line = line ? this.line(line) : '';

    let msg = '\r\n';

    if (fromf && type) msg += '%s (%s) ';
    else if (fromf) msg += '%s ';

    if (line) msg += ' %s ';
    else msg += '...';

    console.log(msg, fromf, type, line);

    return line;
  }

  error(fromf, type, msg1s, msg2s) {
    fromf = fromf ? fromf : '';
    type = type ? type : '';
    msg1s = typeof msg1s === 'string' ? msg1s : '';
    msg2s = typeof msg2s === 'object' ? JSON.stringify(msg2s) : '';

    let msg = '\t%s\r\n\r\n\r\n';

    if (fromf && type) msg = '%s (%s) ' + msg;
    else if (fromf) msg = '%s ' + msg;

    if (msg1s) msg += ' %s ';
    if (msg2s) msg += ' %s ';

    console.error(msg, 'error', fromf, type, msg1s, msg2s);

    return arguments[2];
  }

  watch(type, wpath, path) {
    type = type.toString();

    this.log('watch', type);

    path = path ?? wpath;

    fs.watch(wpath, { encoding: 'buffer' }, (eventType, file) => {
      if (eventType != 'change') return;

      fs.readFile(wpath + '/' + file, (err, data) => {
        if (type != 'scss') {
          this.blob[type][this.indexes[type][file]] = data.toString();
        }

        this.log('update', type, file.toString());

        if (type != 'scss') this.save(type, path, 100, true);
        else this.compile(type, path, true);
      });
    });
  }

  build(type, path) {
    type = type.toString();

    let end = 0;

    if (type in this.contents === false) return;

    this.contents[type].forEach((filename, i) => {
      const file = filename + '.' + type;

      fs.readFile(path + '/' + file, (err, data) => {
        if (err) throw this.error(err);

        this.blob[type][i] = data.toString();
        this.indexes[type][file] = i;

        this.save(type, path, end++);
      });
    });
  }

  compile(type, path, no_uglify) {
    type = type.toString();

    let end = 0;

    this.contents[type].forEach((filename, i) => {
      const file = filename + '.' + type;

      this['compile_' + type](filename, path, no_uglify);
    });
  }

  compile_scss(filename, path, no_uglify) {
    const name = 'style';
    const file = path + '/' + filename + '.scss';

    sass.render({ file }, (err, result) => {
      if (err) throw this.error('compile_scss', 'scss', err);

      this.blob.scss = result.css.toString().replace(/([\r\n]{3})|(\/[\*]+[^!])(=?[\w\W]+?)(\*\/)/g, '');

      fs.writeFile(
        dest + '/' + dst + '/' + name + '.css',
        this.blob.scss,
        (err) => {
          if (err) throw this.error('compile_scss', 'scss', err);
        }
      );

      if (! no_uglify) {
        fs.writeFile(
          dest + '/' + dst + '/' + name + '.min.css',
          this.uglify('scss', path),
          (err) => {
            if (err) throw this.error('save', 'scss', err);
          }
        );
      }
    });
  }

  save(type, path, end, no_uglify) {
    type = type.toString();

    if (end < this.contents[type].length - 1) return;

    const name = (type === 'js') ? 'script' : 'style';

    fs.writeFile(
      dest + '/' + dst + '/' + name + '.' + type,
      this.concat(type, path),
      (err) => {
        if (err) throw this.error('save', type, err);
      }
    );

    if (! no_uglify) {
      fs.writeFile(
        dest + '/' + dst + '/' + name + '.min.' + type,
        this.uglify(type, path),
        (err) => {
          if (err) throw this.error('save', type, err);
        }
      );
    }
  }

  concat(type, path) {
    type = type.toString();

    this.log('concat', type, this.indexes[type]);

    var code = this.blob[type].join('\r\n\r\n').replace(/([\r\n]{3})|(\/[\*]+[^!])(=?[\w\W]+?)(\*\/)/g, '');
    var js_banner;
    if (this.options.js_banner) {
      js_banner = fs.readFileSync(path + '/_banner.js');
      js_banner = js_banner.toString();
    }

    if (type == 'js') {
      if (this.options.js_wrap) code = js_banner + '(function() {\n' + code + '\n})();';
      else code = js_banner + code;
    }
    return code;
  }

  uglify(type, path) {
    type = type.toString();

    if (type == 'js' || type == 'css' || type == 'scss') {
      return this['uglify_' + type](path);
    }
  }

  uglify_js(path) {
    this.log('uglify', 'js');

    var result = new UglifyJS.minify(this.blob.js, this.options.js);

    if (result.error) {
      const error = {
        filename: result.error.filename,
        line: result.error.line,
        col: result.error.col,
        pos: result.error.pos
      }

      throw this.error('uglify', 'js', result.error.message, error);
    }

    var code = result.code;
    var js_banner;
    if (this.options.js_banner) {
      js_banner = fs.readFileSync(path + '/_banner.js');
      js_banner = js_banner.toString();
    }

    if (this.options.js_wrap) code = js_banner + '(function(){' + code + '})()';
    else code = js_banner + code;
    return code;
  }

  uglify_css(path) {
    this.log('uglify', 'css');

    var result = new CleanCSS(this.options.css).minify(this.blob.css.join(''));

    if (result.errors && result.errors.length) {
      throw this.error('uglify', 'css', null, result.errors);
    }

    return result.styles;
  }

  uglify_scss(path) {
    this.log('uglify', 'scss');

    var result = new CleanCSS(this.options.css).minify(this.blob.scss);

    if (result.errors && result.errors.length) {
      throw this.error('uglify', 'scss', null, result.errors);
    }

    return result.styles;
  }

}

new Build(options).router();
