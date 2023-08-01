/*
 * translate/init.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

var languages;

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

      const box = doc.createElement('div');
      box.className = 'message-box';
      box.innerHTML = '<p><b>WebStorage is required</b></p><p>localStorage seems to be unavailable<br>Please reload your browser and try again</p>';
      body.append(box);
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

      if (color == 'light') {
        color = 'dark';
        el.innerText = 'switch to light';
        body.setAttribute('data-color', 'dark');
        body.classList.add('dark');
        setTimeout(function() {
          el.blur();
        }, 100);
      } else if (color == 'dark') {
        color = 'light';
        el.innerText = 'switch to dark';
        body.setAttribute('data-color', 'light');
        body.classList.remove('dark');
        setTimeout(function() {
          el.blur();
        }, 100);
      }

      if (color == 'light' || color == 'dark') {
        localStorage.setItem('preferred-color', color);
      }
    }
  }

  function loader(xhr) {
    let storage;
    try {
      languages = storage = JSON.parse(xhr.response);
      route();
      localStorage.setItem('languages', JSON.stringify(languages));
    } catch (err) {
      console.error('loader', err);
    }
  }

  function resume() {
    let storage = localStorage.getItem('languages');
    try {
      if (storage) {
        languages = storage = JSON.parse(storage);
        route();
      } else {
        request.then(loader).catch(error);
      }
    } catch (err) {
      console.error('resume', err);
    }
  }

  function popState(evt) {
    route();
  }

  function error(xhr) {
    // console.warn(xhr);
  }

  doc.description = doc.querySelector('meta[name="description"]');
  requiredStorage();
  preferredColor();
  doc.getElementById('head').addEventListener('click', switchColor);
  window.addEventListener('popstate', popState);
  resume();
}

init();
