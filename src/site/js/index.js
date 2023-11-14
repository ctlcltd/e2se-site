/*
 * landing/index.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

const doc = document;
const body = doc.body;
const head = doc.getElementById('head');
// var platform;

function preferredColor() {
  let color = sessionStorage.getItem('preferred-color');
  color = color == 'light' || color == 'dark' ? color : null;
  color = color ?? (matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (color) {
    body.setAttribute('data-color', color);
    if (color == 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }
}

function switchColor(evt) {
  let el = evt.target;
  el = el.id == 'switch-color' ? el : el.closest('#switch-color');

  if (el) {
    let color = body.hasAttribute('data-color') ? body.getAttribute('data-color') : 'light';

    if (color == 'light' || color == 'dark') {
      const switched = color == 'light' ? 'dark' : 'light';
      body.setAttribute('data-color', switched);

      if (color == 'light') {
        body.classList.add('dark');
      } else {
        body.classList.remove('dark');
      }

      setTimeout(function() {
        el.blur();
      }, 100);

      sessionStorage.setItem('preferred-color', switched);
      load_images();
    }
  }
}

function offCanvas(evt) {
  let el = evt.target;
  el = el.hasAttribute('data-target') ? el : el.closest('[data-target]');

  function close(evt) {
    const el = evt.target;

    if (el.className == 'backdrop') {
      const sides = doc.querySelectorAll('#side aside');
      body.classList.remove('offcanvas');
      body._backdrop.remove();
    }
  }

  function backdrop() {
    const el = document.createElement('div');
    el.className = 'backdrop';
    body._backdrop = el;
    body.append(el);
    body.addEventListener('click', close);
  }

  function toggle(el) {
    if (body.classList.contains('offcanvas')) {
      body.removeEventListener('click', close);
    } else {
      backdrop();
    }
    if (el) {
      body.classList.toggle('offcanvas');
      el.classList.toggle('on');
    }
  }

  if (el) {
    const query = el.getAttribute('data-target');
    const side = doc.querySelector(query);
    console.log(query);

    toggle(side);

    setTimeout(function() {
      el.blur();
    }, 100);
  }
}

function abbrbox() {
  function box(el) {
    const box = doc.createElement('div');
    const inner = doc.createElement('div');
    box.className = 'abbrbox';
    inner.className = 'inner';
    inner.innerText = el._title;
    box.append(inner);
    el.append(box);
    el._abbr = box;

    setTimeout(function() {
      body._abbrbox = el;
    }, 0);
    setTimeout(function() {
      close(el);
    }, 7e3);
  }

  function close(el) {
    if (el._abbr) {
      el._abbr.remove();
      delete el._abbr;
      delete body._abbrbox;
    }
  }

  function event(evt) {
    const el = evt.target;

    if (el.nodeName === 'ABBR' && ! el._abbr) {
      box.call(this, el);
    } else if (el._abbr) {
      close.call(this, el);
    } else if (body._abbrbox) {
      close.call(this, body._abbrbox);
    }
  }

  for (const el of doc.querySelectorAll('abbr')) {
    el._title = el.title;
    el.setAttribute('title', '');
    el.addEventListener('click', event);
    el.addEventListener('mouseenter', event);
  }
  body.addEventListener('click', event);
}

function platform_detect() {
  function test(s) {
    if (/win/i.test(s)) {
      return 'w';
    } else if (/mac/i.test(s) || /safari/i.test(s)) {
      return 'm';
    }
  }
  return (test(navigator.platform) ?? test(navigator.useragent)) ?? 'f';
}

function load_images(evt) {
  let color = sessionStorage.getItem('preferred-color');
  color = color == 'light' || color == 'dark' ? color[0] : null;
  let i = 0;

  for (const el of doc.querySelectorAll('.img img')) {
    el.disabled = true;
    el.removeAttribute('src');

    // 
    window.platform = window.platform ?? platform_detect();
    // platform = platform ?? platform_detect();

    let id = el.parentElement.className.substr(-1);
    let img = 'screenshot-';

    if (id == 'f') {
      id = 'a';
      img += 'sat-list-editor';
      color = i++ ? 'd' : 'l';
    } else if (id == 'a' || id == 'b' || id == 'd' || id == 'e') {
      if (id == 'a') {
        img += 'sat-list-editor';
      } else if (id == 'b') {
        img += 'sat-channel-book';
      } else if (id == 'd') {
        img += 'edit-service-transponders-sat';
      } else if (id == 'e') {
        img += 'picons-editor-sat';
      }
      color = color ?? (matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'd' : 'l');
    } else {
      return;
    }

    const src = 'img/' + img + '_' + id + platform + color + platform + '.svg';
    el.setAttribute('src', src);
    el.disabled = false;
  }
}

preferredColor();
head.addEventListener('click', switchColor);
head.addEventListener('click', offCanvas);
load_images();
window.addEventListener('appearance-changed', load_images);
abbrbox();