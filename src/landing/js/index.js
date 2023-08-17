/*
 * landing/index.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

const doc = document;
const body = doc.body;
var platform, theme;

function preferredColor() {
  const color = sessionStorage.getItem('preferred-color');

  if (color == 'light' || color == 'dark') {
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

  for (const el of doc.querySelectorAll('.img img')) {
    el.setAttribute('hidden', '');
    el.setAttribute('src', '');

    platform = platform ?? platform_detect();
    theme = color ?? (matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'd' : 'l');
    theme = platform == 'w' ? 'l' : theme + platform;

    const src = '../src/test/' + platform + '-' + theme + '.svg';
    el.setAttribute('src', src);
    el.removeAttribute('hidden');
  }
}

preferredColor();
doc.getElementById('head').addEventListener('click', switchColor);
load_images();
window.addEventListener('appearance-changed', load_images);

window.className = '';
