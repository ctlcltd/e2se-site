/*
 * translate/init.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

var languages;
var msg;

function init() {
  const doc = document;
  const body = doc.body;
  const request = source_request('langs');

  function requiredStorage() {
    try {
      if (! localStorage.getItem('_time')) {
        localStorage.setItem('_time', new Date().toJSON());
      }
      if (! localStorage.getItem('_time')) {
        throw 'Storage Error';
      }
    } catch (err) {
      console.error('requiredStorage', err);

      message('storage');
    }
  }

  function preferredColor() {
    const color = localStorage.getItem('preferred-color');

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

        localStorage.setItem('preferred-color', switched);
      }
    }
  }

  function view() {
    try {
      if (! localStorage.getItem('_lock')) {
        route();
      }

      your_token();
    } catch (err) {
      console.error('view', err);

      route();
    }
  }

  function loader(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      languages = obj;

      view();

      localStorage.setItem('languages', JSON.stringify(languages));
    } catch (err) {
      console.error('loader', err);
    }
  }

  function resume() {
    try {
      const storage = localStorage.getItem('languages');

      if (storage) {
        const obj = JSON.parse(storage);

        languages = obj;

        view();
      } else {
        request.then(loader).catch(error);
      }
    } catch (err) {
      console.error('resume', err);
    }
  }

  function error(xhr) {
    // console.warn(xhr);
  }

  function popState(evt) {
    route();
  }

  doc.description = doc.querySelector('meta[name="description"]');
  requiredStorage();
  preferredColor();
  doc.getElementById('head').addEventListener('click', switchColor);
  window.addEventListener('popstate', popState);
  resume();
}

init();
