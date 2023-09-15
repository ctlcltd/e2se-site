/*
 * landing/index.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

const doc = document;
const body = doc.body;
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

    const button = doc.getElementById('switch-color');
    button.innerText = 'switch to ' + (color == 'light' ? 'dark' : 'light');
  }
}

function switchColor(evt) {
  const el = evt.target;
  if (el.id == 'switch-color') {
    let color = body.hasAttribute('data-color') ? body.getAttribute('data-color') : 'light';

    if (color == 'light' || color == 'dark') {
      const switched = color == 'light' ? 'dark' : 'light';
      el.innerText = 'switch to ' + color;
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
    } else if (/mac/i.test(s)) {
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
      // 
      color = platform == 'w' ? 'l' : color;
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
      color = platform == 'w' ? 'l' : color;
    } else {
      return;
    }

    const src = 'img/' + img + '_' + id + platform + color + platform + '.svg';
    el.setAttribute('src', src);
    el.disabled = false;
  }
}

preferredColor();
doc.getElementById('head').addEventListener('click', switchColor);
load_images();
window.addEventListener('appearance-changed', load_images);
abbrbox();
