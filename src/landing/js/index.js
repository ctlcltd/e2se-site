/*
 * landing/index.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

const doc = document;
const body = doc.body;
var platform;

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
    // platform = platform ?? platform_detect();
    platform = platform_detect();

    let img;
    const id = el.parentElement.className.substr(-1);

    if (id != 'f') {
      color = color ?? (matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'd' : 'l');

      if (id == 'b' || id == 'd' || id == 'e') {
        img = id;
      }
      // 
      if (id == 'd') {
        platform = 'w';
      }
    } else {
      color = i++ ? 'd' : 'l';
    }

    const src = '../src/test/' + (img ? img + '-' : '') + platform + '-' + (platform == 'w' ? 'l' : color) + platform + '.svg';
    el.setAttribute('src', src);
    el.disabled = false;
  }
}

preferredColor();
doc.getElementById('head').addEventListener('click', switchColor);
load_images();
window.addEventListener('appearance-changed', load_images);
