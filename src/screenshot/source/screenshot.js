/*!
 * src/screenshot/source/screenshot.js
 *
 * screenshot script
 *
 * @author Leonardo Laureti
 * @license MIT License
 */

var screenshots = {
  'lm': 'macx light',
  'dm': 'macx dark',
  'lw': 'win light',
  'dw': 'win dark',
  'lf': 'fusion light',
  'df': 'fusion dark'
};

var svg = document.rootElement;
var current = null;


function style(e) {
  const id = e.target.getAttribute('id');
  const name = id.length ? id.replace('selector_', '') : 'lm';
  const sys = id.length ? id[id.length - 1] : 'm';

  (current !== null) && flatten_revert();

  if (name in screenshots) {
    for (const g of svg.querySelectorAll('#window, #tint-d, #addchannel, #editservice, #dnd')) {
      g.setAttribute('class', sys + ' ' + name);
    }

    document.getElementsByTagName('svg')[0].setAttribute('transform', 'matrix(1,1,1,1,0,0)');
    document.getElementsByTagName('svg')[0].setAttribute('transform', '');

    console.info('style', screenshots[name]);
  }
}


function clone() {
  current = svg.cloneNode(true);
  var elements = current.querySelectorAll('*');

  for (const el of elements) {
    if (el.nodeName == 'link' || el.nodeName == 'script') {
      el.remove();
    }
    if (/selector|controller/.test(el.id)) {
      el.remove();
    }
  }
}


function revert() {
  if (current == null) {
    return;
  }

  var elements;
  elements = svg.querySelectorAll('*');

  for (const el of elements) {
    if (el.nodeName == 'link' || el.nodeName == 'script') {
      continue;
    }
    if (/selector|controller/.test(el.id)) {
      continue;
    }

    el.remove();
  }

  elements = current.querySelectorAll(':scope > *');

  for (const el of elements) {
    svg.append(el);
  }

  svg.removeAttribute('style');
  svg.setAttribute('id', current.id);
  current = null;
}


function flatten_trigger() {
  const selector = document.getElementById('selector');
  const controller = document.getElementById('controller');

  controller.getElementsByTagName('text')[0].removeEventListener('click', flatten_trigger);
  controller.getElementsByTagName('text')[1].removeEventListener('click', flatten_revert);
  selector.removeEventListener('click', screenshot_selector);

  (current !== null) && flatten_revert();
  clone();

  ('flatten' in window) && flatten();

  controller.getElementsByTagName('text')[0].addEventListener('click', flatten_trigger);
  controller.getElementsByTagName('text')[1].addEventListener('click', flatten_revert);
  selector.addEventListener('click', screenshot_selector);
}


function flatten_revert() {
  if (current == null) {
    return;
  }

  const selector = document.getElementById('selector');
  const controller = document.getElementById('controller');

  selector.remove();
  controller.remove();

  revert();

  svg.append(selector);
  svg.append(controller);
}


function screenshot_selector() {
  var sizes = [95, 200, 320, 420, 525, 650];
  let i = 0;

  const g = document.createElementNS(svg.namespaceURI, 'g');
  g.setAttribute('id', 'selector');
  g.setAttribute('transform', 'matrix(1,0,0,1,50,1270)');

  for (const style in screenshots) {
    const text = document.createElementNS(svg.namespaceURI, 'text');
    text.setAttribute('id', 'selector' + '_' + style);
    text.setAttribute('dx', sizes[i++]);
    text.setAttribute('style', 'font-family:sans-serif;font-weight:bold;text-decoration:underline;cursor:pointer;');
    text.innerHTML = screenshots[style];
    g.append(text);
  }

  svg.append(g);
  g.addEventListener('click', style);
}


function screenshot_controller() {
  var sizes = [50, 150];
  let i = 0;

  const g = document.createElementNS(svg.namespaceURI, 'g');
  g.setAttribute('id', 'controller');
  g.setAttribute('transform', 'matrix(1,0,0,1,800,1270)');

  const submit = document.createElementNS(svg.namespaceURI, 'text');
  submit.setAttribute('id', 'controller' + '_' + 'submit');
  submit.setAttribute('dx', sizes[i++]);
  submit.setAttribute('style', 'font-family:sans-serif;font-weight:bold;text-decoration:underline;cursor:pointer;');
  submit.innerHTML = 'FLATTEN';
  submit.addEventListener('click', flatten_trigger);
  g.append(submit);

  const reset = document.createElementNS(svg.namespaceURI, 'text');
  reset.setAttribute('id', 'controller' + '_' + 'reset');
  reset.setAttribute('dx', sizes[i++]);
  reset.setAttribute('style', 'font-family:sans-serif;font-weight:bold;text-decoration:underline;cursor:pointer;');
  reset.innerHTML = 'REVERT';
  reset.addEventListener('click', flatten_revert);
  g.append(reset);

  svg.append(g);
}


screenshot_selector();
screenshot_controller();

window.onload = function() {
  document.getElementById('noscript').remove();
}

