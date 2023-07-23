/*
 * translate/init.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

var languages;

function init() {
  const name = 'langs';
  const request = source_request(name);

  function resumeColor() {
    const color = window.localStorage.getItem('preferred-color');

    if (color == 'light' || color == 'dark') {
      document.body.setAttribute('data-color', color);
      if (color == 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }

      const button = document.getElementById('switch-color');
      button.innerText = 'switch to ' + (color == 'light' ? 'dark' : 'light');
    }
  }

  function switchColor(evt) {
    const el = evt.target;
    if (el.id == 'switch-color') {
      let color = document.body.hasAttribute('data-color') ? document.body.getAttribute('data-color') : 'light';

      if (color == 'light') {
        color = 'dark';
        el.innerText = 'switch to light';
        document.body.setAttribute('data-color', 'dark');
        document.body.classList.add('dark');
        window.setTimeout(function() {
          el.blur();
        }, 100);
      } else if (color == 'dark') {
        color = 'light';
        el.innerText = 'switch to dark';
        document.body.setAttribute('data-color', 'light');
        document.body.classList.remove('dark');
        window.setTimeout(function() {
          el.blur();
        }, 100);
      }

      if (color == 'light' || color == 'dark') {
        window.localStorage.setItem('preferred-color', color);
      }
    }
  }

  function load(xhr) {
    try {
      languages = JSON.parse(xhr.response);

      route();
    } catch (err) {
      // console.error('init()', 'load()', err);

      error(null, err);
    }
  }

  function resume() {

  }

  function popState(evt) {
    route();
  }

  function error(xhr, err) {
    console.error('init()', 'error()', xhr || '', err || '');
  }

  resumeColor();
  document.getElementById('head').addEventListener('click', switchColor);
  request.then(load).catch(error);
  window.addEventListener('popstate', popState);
}

init();
