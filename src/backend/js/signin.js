/*
 * backend/signin.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function signin() {
  const doc = document;
  const view = doc.getElementById('signin');
  const form = doc.getElementById('sign_login');
  const placeholder = form.querySelector('.placeholder').cloneNode();
  const attempts_limit = 3;
  let attempts = 0;
  let msg = null;

  function submit(evt) {
    evt.preventDefault();

    form.setAttribute('disabled', '');
    form.setAttribute('data-loading', '');

    if (msg) {
      msg.replaceWith(placeholder);
    }

    let obj = [];

    for (const el of this.elements) {
      if (el.tagName != 'FIELDSET' && el.tagName != 'BUTTON' && ! (el.type && el.type === 'button')) {
        obj.push(el.name + '=' + el.value);
      }
    }

    if (obj.length) {
      obj = obj.join('&');
    } else {
      form.removeAttribute('disabled');
      form.removeAttribute('data-loading');
      form.reset();

      return message('Please enter your credentials.');
    }

    const request = api_request('post', 'login', '', obj);

    request.then(loader).catch(error);
  }

  function message(text) {
    msg = doc.createElement('div');
    msg.className = 'error';
    msg.innerText = text;

    form.querySelector('.placeholder').replaceWith(msg);
  }

  function loader(xhr) {
    form.reset();

    try {
      const obj = JSON.parse(xhr.response);

      if (obj.status && obj.data) {
        form.removeAttribute('disabled');
        form.removeAttribute('data-loading');

        view.setAttribute('hidden', '');

        sessionStorage.setItem('backend', new Date().toJSON());

        return route(basepath + '/');
      } else {
        if (attempts++ < attempts_limit) {
          form.removeAttribute('disabled');
        }

        message('Wrong credentials.');
      }
    } catch (err) {
      form.removeAttribute('data-loading');
      form.reset();
      
      message('An error occurred.');

      console.error('loader', err);
    }
  }

  function error(xhr) {
    form.reset();
    console.warn(xhr);
  }

  sessionStorage.clear();

  form.addEventListener('submit', submit);

  view.removeAttribute('hidden');
}
