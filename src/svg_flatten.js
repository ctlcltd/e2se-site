/*!
 * src/svg-flatten.js
 *
 * SVG image transform
 *
 * @author Leonardo Laureti
 * @license MIT License
 */

document.getElementById('test').remove();

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
  if (/rgb\(.+\)/.test(value)) {
    value = rgbToHex(value);
  } else if (/url\(.+\)/.test(value)) {
    value = value.replace(/"/g, '');
  } else if (/,\s/.test(value)) {
    value = value.replace(/,\s/g, ',');
  }
  return value;
}

function round(value) {
  value = value.toPrecision(3);
  value = value.trimEnd('0');
  return Number(value);
}



const excluded = [ 'block-size', 'inline-size', 'perspective-origin', 'text-wrap', 'transform-origin', 'user-select', 'zoom' ];
const attributes = [ 'x', 'y', 'cx', 'cy', 'dx', 'dy', 'width', 'height', 'rx', 'ry', 'transform', 'style' ];
const ordered = [ 'display', 'x', 'y', 'cx', 'cy', 'dx', 'dy', 'width', 'height', 'rx', 'ry', 'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width', 'transform', 'clip-path', 'filter' ];


const svg = document.rootElement;

const src_size = svg.outerHTML.length / 1e3;

const styles = document.querySelector('link[rel="stylesheet"]');
styles.disabled = true;
const rcs = getComputedStyle(svg);
styles.disabled = false;


const root = svg.querySelector('#window');
var elements = svg.querySelectorAll('g, g *');
var used = new Set;

for (const el of elements) {
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

    if (prop == 'fill' && (_style && value != _style || _style == 'none')) {
      fix = true;
    } else if (prop == 'font-weight' && _style && value != _style) {
      fix = true;
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
        }
      } else {
        atts[prop] = replace(value);
      }

      if (/url\(.+\)/.test(value)) {
        const href = value.match(/url\("(.+)"\)/);
        used.add(href[1].substr(1));
      }

      // console.log(el, prop, { value, _parent, _default });
    }
  }

  var s = [];
  for (const prop in css) {
    s.push(prop + ':' + css[prop]);
  }
  if (s.length) {
    atts.style = s.join(';');
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


elements = svg.querySelectorAll('g, g *');

for (const el of elements) {
  if (el.hasAttribute('transform')) {
    const m = el.transform.baseVal[0].matrix;
    // const ctm = child.getCTM();

    if (m.a == 1 && m.d == 1 && m.b == 0 && m.c == 0 && (m.e != 0 || m.f != 0)) {
      if (el.nodeName == 'g') {
        for (const child of el.children) {
          if (child.hasAttribute('transform')) {
            const cm = child.transform.baseVal[0].matrix;
            const matrix = { a: cm.a, b: cm.b, c: cm.c, d: cm.d, e: cm.e, f: cm.f };

            matrix.a = round(cm.a);
            matrix.b = round(cm.b);
            matrix.c = round(cm.c);
            matrix.d = round(cm.d);
            matrix.e = cm.e + m.e;
            matrix.f = cm.f + m.f;

            child.setAttribute('transform', 'matrix(' + Object.values(matrix).join(',') + ')');
          } else if (el.nodeName == 'g') {
            const matrix = { a: 1, b: 0, c: 0, d: 1, e: m.e, f: m.f };

            child.setAttribute('transform', 'matrix(' + Object.values(matrix).join(',') + ')');
          } else if (child.nodeName == 'g') {
            console.log(child);
          } else {
            const pos = { x: child.hasAttribute('x') ? parseFloat(child.getAttribute('x')) : 0, y: child.hasAttribute('y') ? parseFloat(child.getAttribute('y')) : 0 };
            const matrix = { e: 0, f: 0 };

            matrix.e = pos.x + m.e;
            matrix.f = pos.y + m.f;

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
        const matrix = { e: m.e, f: m.f };

        matrix.e = pos.x + m.e;
        matrix.f = pos.y + m.f;

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
      const matrix = { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f };

      matrix.a = round(m.a);
      matrix.b = round(m.b);
      matrix.c = round(m.c);
      matrix.d = round(m.d);

      el.setAttribute('transform', 'matrix(' + Object.values(matrix).join(',') + ')');
    }
  }
}


//
// fix text x pos  win | fusion
// 
// .tree text, .tree text > tspan

if (/w|f/.test(root.getAttribute('_class'))) {
  root.setAttribute('class', root.getAttribute('_class'));

  elements = svg.querySelectorAll('g[_class="tree"]');

  for (const el of elements) {
    el.closest('g[_id="split-end"]').setAttribute('id', 'split-end');
    el.setAttribute('class', 'tree');

    let m = getComputedStyle(el.closest('g[_id="split-end"]')).transform;
    m = m.substr(7, m.length - 8).split(', ');
    m = { e: parseFloat(m[4]), f: parseFloat(m[5]) };

    for (const child of el.querySelectorAll('g[_class="tree-cols"], g[_class="tree-items"]')) {
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
        }

        matrix.e = pos.x + m.e + cm.e + tm.e;
        matrix.f = pos.y + m.f + cm.f + tm.f;

        // console.log(matrix.e, pos.x, m.e, cm.e, tm.e);

        txt.setAttribute('x', matrix.e);

        // if (matrix.f) {
        //   txt.setAttribute('y', matrix.f);
        // } else {
        //   txt.removeAttribute('y');
        // }
      }

      child.removeAttribute('class');
    }

    el.closest('g[_id="split-end"]').removeAttribute('id');
  }

  root.removeAttribute('class');
}


// 
// fix text x pos  win
// 
// #t-txt, text.focused
if (/w/.test(root.getAttribute('_class'))) {
  root.setAttribute('class', root.getAttribute('_class'));

  {
    const txt = root.querySelector('text[_id="t-txt"]');
    txt.setAttribute('id', txt.getAttribute('_id'));

    let tm = getComputedStyle(txt).transform;
    tm = tm.substr(7, tm.length - 8).split(', ');
    tm = { e: parseFloat(tm[4]) || 0, f: parseFloat(tm[5]) || 0 };

    const dpos = { dx: txt.hasAttribute('dx') ? parseFloat(txt.getAttribute('dx')) : 0, dy: txt.hasAttribute('dy') ? parseFloat(txt.getAttribute('dy')) : 0 };
    const matrix = { e: 0, f: 0 };

    matrix.e = dpos.dx + tm.e;
    matrix.f = dpos.dy + tm.f;

    txt.setAttribute('x', 82);
    txt.setAttribute('dx', matrix.e);
    // txt.setAttribute('dy', matrix.f);
    txt.removeAttribute('text-anchor');

    txt.removeAttribute('id');
  }

  root.removeAttribute('class');
}


elements = svg.querySelectorAll('g *');

for (const el of elements) {
  if (el.nodeName == 'use') {
    used.add(el.getAttribute('href').substr(1));
  }
}


var resources = svg.querySelector('defs');

for (const res of resources.children) {
  if (! used.has(res.id)) {
    res.remove();
  }
}


idmap = {};
resources = svg.querySelector('defs');
elements = svg.querySelectorAll('g *');

for (var i = 0; i < resources.children.length; i++) {
  const res = resources.children.item(i);
  idmap[res.id] = res.id[0] + String.fromCharCode(i + 97) + res.id[res.id.length - 1];
  res.id = idmap[res.id];
  // console.log(res.id);
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


elements = svg.querySelectorAll('g, g *');

for (const el of elements) {
  el.removeAttribute('xmlns');

  el.removeAttribute('_id');
  el.removeAttribute('_class');
}



const dst_size = svg.outerHTML.length / 1e3;

console.log({ src_size, dst_size });

