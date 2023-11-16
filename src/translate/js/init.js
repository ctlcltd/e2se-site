/* translate/init.js */

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
        throw except(2);
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

  function resetButton() {
    const button = doc.getElementById('reset');

    function click(evt) {
      message('reset');
    }

    button.addEventListener('click', click);
  }

  function view() {
    try {
      if (localStorage.getItem('_lock') != 'send') {
        route();
        localStorage.removeItem('_lock');
      }

      your_token();
      form_token();
    } catch (err) {
      console.error('view', err);

      route();
    }
  }

  function loader(xhr) {
    try {
      checker(xhr.status);

      const obj = JSON.parse(xhr.response);

      languages = obj;

      view();

      localStorage.setItem('languages', JSON.stringify(languages));
    } catch (err) {
      fault(err);

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
      message('error');

      console.error('resume', err);
    }
  }

  function error(xhr) {
    message('reqerr');

    console.warn(xhr);
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
  resetButton();
}

init();
