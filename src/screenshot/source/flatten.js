/*!
 * src/screenshot/source/flatten.js
 *
 * flatten svg screenshot
 *
 * @author Leonardo Laureti
 * @license MIT License
 */

const excluded = [ 'block-size', 'd', 'inline-size', 'overflow-x', 'overflow-y', 'perspective-origin', 'text-decoration-line', 'text-wrap', 'transform-origin', 'zoom', '-webkit-text-decorations-in-effect' ];
const attributes = [ 'x', 'y', 'cx', 'cy', 'dx', 'dy', 'width', 'height', 'rx', 'ry', 'transform', 'style' ];
const ordered = [ 'display', 'x', 'y', 'width', 'height', 'rx', 'ry', 'font-family', 'font-weight', 'font-size', 'letter-spacing', 'word-spacing', 'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width', 'stroke-dasharray', 'text-decoration', 'text-shadow', 'transform', 'clip-path', 'filter', 'opacity' ];

var svg = document.rootElement;
var root = null;
var rcs = null;

function rgbToHex(rgb) {
  var hex = '#' + rgb.match(/\d+/g).map(function(x) {
    return (+x).toString(16).padStart(2, 0);
  }).join('');
  if (hex[1] == hex[2] && hex[3] == hex[4] && hex[5] == hex[6]) {
    hex = '#' + hex[1] + hex[3] + hex[5];
  }
  return hex;
}

function replace(value) {
  if (/rgb\([^\)]+\)/.test(value)) {
    value.match(/rgb\([^\)]+\)/g).map(function(x) { value = value.replace(x, rgbToHex(x)); });
  } else if (/url\(.+\)/.test(value)) {
    value = value.replace(/"/g, '');
  } else if (/,\s/.test(value)) {
    value = value.replace(/,\s/g, ',');
  }
  return value;
}

function round(value) {
  if (! Number.isInteger(value)) {
    value = Math.fround(value);
    value = value.toFixed(3);
    value = value.trimEnd('0');
  }
  return Number(value);
}


function flatten() {
  (rcs == null) && flatten_defaults();

  root = svg.querySelector('#window');

  const classname = root.getAttribute('class');
  const name = classname.length > 1 ? classname.split(' ')[1] : 'lm';
  const sys = classname.length ? classname[0] : 'm';

  console.info('flatten', ('screenshots' in window) ? screenshots[name] : classname);

  const src_size = svg.outerHTML.length / 1e3;

  flatten_style();
  flatten_transform();

  if (/w|f/.test(classname) || svg.getAttribute('id') === 'wide') {
    fix_list_text();

    if (/m/.test(classname)) {
      fix_m_wide();
    }
  }

  if (/w/.test(classname)) {
    fix_w_ttext();
  }

  flatten_resources();
  flatten_finalize();

  svg.removeAttribute('id');

  var f = svg.cloneNode(true);
  f.setAttribute('style', 'pointer-events:none;user-select:none');

  if (/f/.test(classname)) {
    svg.style = 'text-rendering:geometricprecision';
    f.style += ';text-rendering:geometricprecision';
  }

  var elements = f.querySelectorAll(':scope > *');

  for (const el of elements) {
    if (el.nodeName == 'link' || el.nodeName == 'script') {
      el.remove();
    }
    if (/selector|controller/.test(el.id)) {
      el.remove();
    }
  }

  const dst_size = f.outerHTML.length / 1e3;

  console.info('src size', src_size);
  console.info('dst size', dst_size);

  console.log(f.outerHTML);
}


function flatten_defaults() {
  const styles = document.querySelector('link[rel="stylesheet"]');
  styles.disabled = true;
  rcs = getComputedStyle(svg);
  styles.disabled = false;
}


function flatten_style() {

  var elements = svg.querySelectorAll('g, g *');

  for (const el of elements) {
    if (/selector|controller/.test(el.id)) {
      continue;
    }

    const cs = getComputedStyle(el);
    const pcs = getComputedStyle(el.parentElement);
    const style = el.style;
    const attrs = el.attributes;

    const css = {};
    const atts = {};

    for (const prop of cs) {

      if (excluded.indexOf(prop) != -1) {
        continue;
      }

      const value = cs.getPropertyValue(prop);
      const _parent = pcs.getPropertyValue(prop);
      const _default = rcs.getPropertyValue(prop);
      const _style = style.getPropertyValue(prop);

      if (prop in attrs) {
        const attr = attrs[prop];

        if (isNaN(attr.value) && attr.value == replace(value)) {
          continue;
        } else if (attr.value == value.replace('px', '')) {
          continue;
        }
      }

      if (style[prop]) {
        if (attributes.indexOf(prop) == -1) {
          css[prop] = replace(_style);
        } else {
          atts[prop] = replace(_style);
        }
      }

      let fix = (prop == 'display' && value != 'inline');

      if (_style && value != _style) {
        fix = true;
      } else if (prop == 'fill' || prop == 'stroke' || prop == 'filter') {
        fix = value && /url\(.+\)/.test(value) || _style && /url\(.+\)/.test(_style);
      }

      if (value && (value != _default && value != _style && value != _parent) || fix) {
        if (attributes.indexOf(prop) == -1) {
          css[prop] = replace(value);

          if (prop == 'font-weight') {
            if (value == 700) {
              css[prop] = 'bold';
            } else if (value == 400) {
              css[prop] = 'normal';
            }
          } else if (prop == 'font-family') {
            if (/Sans-Serif/.test(css[prop])) {
              css[prop] = css[prop].replace(/(Sans-Serif)/, '"Sans-Serif"');
            }
          } else if (prop == 'text-decoration') {
            css[prop] = css[prop].split(' ')[0];
          }
        } else {
          atts[prop] = replace(value);
        }

        // console.debug(el, prop, { value, _style, _parent, _default });
      }
    }

    var s = [];
    var i = 1e3;
    for (const prop in css) {
      const x = ordered.indexOf(prop) != -1 ? ordered.indexOf(prop) : i++;
      // if (ordered.indexOf(prop) == -1) {
      //   console.debug('unordered property', prop);
      // }
      s[x] = prop + ':' + css[prop];
    }
    if (s.length) {
      atts.style = s.flat().join(';');
    }

    for (const prop in atts) {
      let val = atts[prop];

      if (prop == 'transform' || prop == 'style') {
        val = val.replace(/"/g, '\'');
      } else if (val == 'auto') {
        continue;
      } else if (/px$/.test(val)) {
        val = val.replace('px', '');
      }

      el.setAttribute(prop, val);
    }
  }


  for (let el of elements) {
    if (el.hasAttribute('id')) {
      if (/selector|controller/.test(el.id)) {
        continue;
      }

      el.setAttribute('_id', el.getAttribute('id'));
    }
    if (el.hasAttribute('class')) {
      el.setAttribute('_class', el.getAttribute('class'));
    }

    el.removeAttribute('id');
    el.removeAttribute('class');

    if (el.hasAttribute('style')) {
      var s = el.getAttribute('style').split(';');

      for (const rule of s) {
        if (rule == 'display:none') {
          el = el.remove();
        } else if (rule == 'display:block' || rule == 'display:inline') {
          delete s[s.indexOf(rule)];
        }
      }

      if (el) {
        s = s.flat().join(';');

        if (s.length) {
          el.setAttribute('style', s);
        } else {
          el.removeAttribute('style');
        }
      }
    }
  }
}


function flatten_transform() {

  var elements = svg.querySelectorAll('g, g *');

  for (const el of elements) {
    if (/selector|controller/.test(el.id)) {
      continue;
    }

    if (el.hasAttribute('transform')) {
      const m = el.transform.baseVal[0].matrix;
      // const ctm = child.getCTM();

      if (m.a == 1 && m.d == 1 && m.b == 0 && m.c == 0 && (m.e != 0 || m.f != 0)) {
        if (el.nodeName == 'g') {
          for (const child of el.children) {
            if (child.hasAttribute('transform')) {
              const cm = child.transform.baseVal[0].matrix;
              const matrix = {};

              matrix.a = round(cm.a);
              matrix.b = round(cm.b);
              matrix.c = round(cm.c);
              matrix.d = round(cm.d);
              matrix.e = round(cm.e + m.e);
              matrix.f = round(cm.f + m.f);

              child.setAttribute('transform', 'matrix(' + Object.values(matrix).join(',') + ')');
            } else if (el.nodeName == 'g') {
              const matrix = { a: 1, b: 0, c: 0, d: 1 };

              matrix.e = round(m.e);
              matrix.f = round(m.f);

              child.setAttribute('transform', 'matrix(' + Object.values(matrix).join(',') + ')');
            } else if (child.nodeName == 'g') {
              console.debug(child);
            } else {
              const pos = { x: child.hasAttribute('x') ? parseFloat(child.getAttribute('x')) : 0, y: child.hasAttribute('y') ? parseFloat(child.getAttribute('y')) : 0 };
              const matrix = {};

              matrix.e = round(pos.x + m.e);
              matrix.f = round(pos.y + m.f);

              if (matrix.e) {
                child.setAttribute('x', matrix.e);
              } else {
                child.removeAttribute('x');
              }
              if (matrix.f) {
                child.setAttribute('y', matrix.f);
              } else {
                child.removeAttribute('y');
              }
            }
          }
        } else {
          const pos = { x: el.hasAttribute('x') ? parseFloat(el.getAttribute('x')) : 0, y: el.hasAttribute('y') ? parseFloat(el.getAttribute('y')) : 0 };
          const matrix = {};

          matrix.e = round(pos.x + m.e);
          matrix.f = round(pos.y + m.f);

          if (matrix.e) {
            el.setAttribute('x', matrix.e);
          } else {
            el.removeAttribute('x');
          }
          if (matrix.f) {
            el.setAttribute('y', matrix.f);
          } else {
            el.removeAttribute('y');
          }
        }

        el.removeAttribute('transform');
      } else {
        const matrix = {};

        matrix.a = round(m.a);
        matrix.b = round(m.b);
        matrix.c = round(m.c);
        matrix.d = round(m.d);
        matrix.e = round(m.e);
        matrix.f = round(m.f);

        el.setAttribute('transform', 'matrix(' + Object.values(matrix).join(',') + ')');
      }
    }
  }
}


function flatten_resources() {

  var used = new Set;
  var elements = svg.querySelectorAll('g *');

  for (const el of elements) {
    if (el.nodeName == 'use') {
      used.add(el.getAttribute('href').substr(1));
    } else if (el.hasAttribute('style')) {
      var s = el.getAttribute('style').split(';');
      for (const rule of s) {
        if (/url\(.+\)/.test(rule)) {
          const id = rule.match(/url\((.+)\)/);
          used.add(id[1].substr(1));
        }
      }
    }
  }


  var resources = svg.querySelectorAll('defs [id]');

  for (const res of resources) {
    if (! used.has(res.id)) {
      res.remove();
    }
  }

  var idmap = {};
  resources = svg.querySelectorAll('defs [id]');
  elements = svg.querySelectorAll('g *');

  for (var i = 0; i < resources.length; i++) {
    const res = resources.item(i);
    const c = String.fromCharCode(i + 97 > 122 ? i + 65 : i + 97);
    idmap[res.id] = res.id[0] + c + res.id[res.id.length - 1];
    res.id = idmap[res.id];
    // console.debug(res.id);
  }

  for (const el of elements) {
    if (el.nodeName == 'use') {
      let id = el.getAttribute('href').substr(1);
      id = '#' + idmap[id];
      el.setAttribute('href', id);
    } else if (el.hasAttribute('style') && /url\(.+\)/.test(el.getAttribute('style'))) {
      var s = el.getAttribute('style').split(';');
      for (const rule of s) {
        if (/url\(.+\)/.test(rule)) {
          let id = rule.match(/url\((.+)\)/);
          id = id[1].substr(1);
          id = '#' + idmap[id];
          s[s.indexOf(rule)] = rule.replace(/url\((.+)\)/, 'url(' + id + ')');
        }
      }
      el.setAttribute('style', s.join(';'));
    }
  }
}


function flatten_finalize() {

  var elements;

  for (var i = 0; i != 10; i++) {
    elements = svg.querySelectorAll('g');

    for (const el of elements) {
      if (! el.hasAttribute('transform') && ! el.hasAttribute('style')) {
        if (el.children.length) {
          el.outerHTML = el.innerHTML;
        } else {
          el.remove();
        }
      }
    }
  }


  elements = svg.querySelectorAll('*');

  for (const el of elements) {
    if (el.nodeName == 'link' || el.nodeName == 'script') {
      continue;
    }

    el.removeAttribute('xmlns');

    el.removeAttribute('_id');
    el.removeAttribute('_class');
  }


  elements = svg.querySelectorAll('*');

  for (const el of elements) {
    if (el.hasAttribute('style') && el.getAttribute('style') == 'fill:none') {
      el.remove();
    }
  }
}


//
// fix list text
// 
// cols text, list text, list text > tspan

function fix_list_text() {

  root.setAttribute('class', root.getAttribute('_class'));

  var elements = svg.querySelectorAll('g[_class="list"], g[_id="ch-end"]');

  for (const el of elements) {
    let parent;

    if (el.closest('g[_id="split-end"]')) {
      parent = el.closest('g[_id="split-end"]');
    } else if (el.closest('g[_id="split-start"]')) {
      parent = el.closest('g[_id="split-start"]');
    } else if (el.closest('g[_id="ch-start"]')) {
      parent = el.closest('g[_id="ch-start"]');
    } else if (el.closest('g[_id="ch-end"]')) {
      parent = el.closest('g[_id="ch-end"]');
    } else {
      continue;
    }

    parent.setAttribute('id', parent.getAttribute('_id'));
    el.setAttribute('class', 'list');

    let m = getComputedStyle(parent).transform;
    if (m != 'none') {
      m = m.substr(7, m.length - 8).split(', ');
      m = { e: parseFloat(m[4]), f: parseFloat(m[5]) };
    } else {
      m = { e: 0, f: 0 };
    }

    for (const child of el.querySelectorAll('g[_class="list-cols"], g[_class="items"]')) {
      child.setAttribute('class', child.getAttribute('_class'));
      let cm = getComputedStyle(child).transform;
      cm = cm.substr(7, cm.length - 8).split(', ');
      cm = { e: parseFloat(cm[4]) || 0, f: parseFloat(cm[5]) || 0 };

      let x = 0;
      let tm = { e: 0, f: 0 };

      for (const txt of child.querySelectorAll('text, tspan')) {
        const pos = { x: txt.hasAttribute('x') ? parseFloat(txt.getAttribute('x')) : 0, y: txt.hasAttribute('y') ? parseFloat(txt.getAttribute('y')) : 0 };
        const matrix = { e: 0, f: 0 };

        if (txt.nodeName == 'text') {
          tm = getComputedStyle(txt).transform;
          tm = tm.substr(7, tm.length - 8).split(', ');
          tm = { e: parseFloat(tm[4]) || 0, f: parseFloat(tm[5]) || 0 };

          if (svg.getAttribute('id') === 'wide') {
            tm.e += 1440;
          } else if (svg.getAttribute('id') == 'channelbook') {
            if (/w/.test(root.getAttribute('class'))) {
              if (child.getAttribute('class') == 'list-cols') tm.e = 1;
              else if (parent.getAttribute('id') == 'split-end' && txt == txt.parentElement.lastElementChild) tm.e = -4;
              else if (tm.e == 0) tm.e = -3;
            } else if (/f/.test(root.getAttribute('class'))) {
              if (child.getAttribute('class') == 'list-cols') tm.e = -2;
              else if (parent.getAttribute('id') == 'split-end' && txt == txt.parentElement.lastElementChild) tm.e = -4;
              else if (tm.e == 0) tm.e = -3;
            }
          }
        }

        matrix.e = pos.x + m.e + cm.e + tm.e;
        matrix.f = pos.y + m.f + cm.f + tm.f;

        // console.debug(matrix.e, pos.x, m.e, cm.e, tm.e);

        txt.setAttribute('x', matrix.e);
        // txt.removeAttribute('y');
      }

      child.removeAttribute('class');
    }

    parent.removeAttribute('id');
  }

  root.removeAttribute('class');
}


// 
// fix t-txt  win
// 
// t-txt

function fix_w_ttext() {

  root.setAttribute('class', root.getAttribute('_class'));

  if (svg.querySelector('text[_class="t-txt"]')) {
    var elements = svg.querySelectorAll('text[_class="t-txt"]');

    for (const txt of elements) {
      txt.setAttribute('class', txt.getAttribute('_class'));

      let fix;
      if (svg.getAttribute('id') === 'piconseditor') {
        fix = 502;
      } else if (svg.getAttribute('id') === 'wide') {
        if (txt.closest('g[_id="editservice"]')) {
          fix = -436;
        } else {
          fix = 1522;
        }
      } else if (svg.getAttribute('id') === 'channelbook') {
        fix = -487;
      } else {
        fix = 82;
      }

      let tm = getComputedStyle(txt).transform;
      tm = tm.substr(7, tm.length - 8).split(', ');
      tm = { e: parseFloat(tm[4]) || 0, f: parseFloat(tm[5]) || 0 };

      const dpos = { dx: txt.hasAttribute('dx') ? parseFloat(txt.getAttribute('dx')) : 0, dy: txt.hasAttribute('dy') ? parseFloat(txt.getAttribute('dy')) : 0 };
      const matrix = { e: 0, f: 0 };

      matrix.e = dpos.dx + tm.e;
      matrix.f = dpos.dy + tm.f;

      txt.setAttribute('x', fix);
      txt.setAttribute('dx', matrix.e);
      // txt.setAttribute('dy', matrix.f);
      txt.removeAttribute('text-anchor');

      txt.removeAttribute('class');
    }
  }

  root.removeAttribute('class');
}


// 
// fix wide  macx
// 
// split, t-ctrs-m

function fix_m_wide() {

  root.setAttribute('class', root.getAttribute('_class'));

  var elements = svg.querySelector('g[_id="window"]').querySelectorAll('g[_class="t-ctrs-m"] ellipse, g[_id="split"] ellipse');

  for (const el of elements) {
    let x = parseFloat(el.getAttribute('cx'));
    x += 1440;
    el.setAttribute('cx', x);
  }

  root.removeAttribute('class');
}



flatten_defaults();

