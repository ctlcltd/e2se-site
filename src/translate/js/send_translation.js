/*
 * translate/send_translation.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function send_translation() {
  console.log('send_translation()');

  const doc = document;
  const page = doc.getElementById('page');

  let form;

  function submit(evt) {
    evt.preventDefault();

    try {
      let translation;
      let lang_code;
      let lang_guid;
      let language;
      let user;

      let storage;

      for (const lang in languages) {
        const tr_key = 'tr-' + lang;
        const obj = languages[lang];
        if (storage = localStorage.getItem(tr_key)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length > 1) {
            translation = storage;
            lang_code = lang;
            lang_guid = obj.guid;
            break;
          }
        }
      }

      for (const lang in languages) {
        const obj = languages[lang];
        if (! obj.guid) {
          if (obj.code === lang_code) {
            language = obj;
          } else {
            translation = null;
          }
          break;
        }
      }

      if (! translation) {
        throw 'Not a valid translation submit';
      }

      let data = {};

      if (language) {
        data['language'] = language;
      } else if (lang_guid) {
        data['lang'] = lang_guid;
      } else {
        throw 'Not a valid submit';
      }

      data['translation'] = translation;

      const input = form.querySelector('[name="send_user"]');

      if (input.value) {
        data['user'] = input.value;
      }

      const token = get_token();
      const request = api_request('post', 'userland', 'submit', {token, data});

      form.setAttribute('data-loading', '');

      request.then(sent).catch(error);
    } catch (err) {
      console.error('submit', err);
    }
  }

  function cancel(evt) {
    const el = evt.target;

    if (el.nodeName == 'BUTTON' && el.type == 'button') {
      send_unlock();
      route(basepath + '/');
    }
  }

  function sent(xhr) {
    form.removeAttribute('data-loading');

    try {
      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error(xhr);
      }

      if (obj.data) {
        const data = obj.data;

        if (data && data.token && validate_token(data.token)) {
          reset_data(false);

          localStorage.setItem('_token', 1);
          localStorage.setItem('your-token', data.token);

          message('your-token', '', 1);
        } else {
          throw 'An error occurred';
        }
      } else {
        throw 'An error occurred';
      }
    } catch (err) {
      message('error');

      console.error('loader', err);
    }

    send_unlock();
    route(basepath + '/');
  }

  function error(xhr) {
    console.warn(xhr);

    form.removeAttribute('data-loading');

    message('request-error');

    send_unlock();
  }

  function allowSubmit(evt) {
    try {
      let storage;
      for (const lang in languages) {
        const tr_key = 'tr-' + lang;
        if (storage = localStorage.getItem(tr_key)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length > 1) {
            page_view();
            break;
          }
        }
      }
    } catch (err) {
      console.error('allowSubmit', err);
    }
  }

  function render_form() {
    const fieldset = doc.createElement('fieldset');

    const div = doc.createElement('div');

    const label = document.createElement('label');
    const input = document.createElement('input');
    const describe = document.createElement('span');

    label.innerText = 'User name';
    input.name = 'send_user';
    input.setAttribute('type', 'text');
    describe.className += 'describe';
    describe.innerHTML = '<p>You could add your name or acronym before submit.</p><p><em>Please do not enter sensitive informations.</em></p>';

    div.append(label);
    div.append(input);
    div.append(describe);

    fieldset.append(div);

    form.insertBefore(fieldset, form.firstElementChild);

    form.classList.remove('placeholder');
    form.addEventListener('submit', submit);
    form.addEventListener('click', cancel);
  }

  function page_view() {
    page_reset();

    doc.title = 'Send translation - Translations';
    doc.description.setAttribute('content', 'Send translation strings');

    const source = doc.querySelector('.send-translation');
    const clone = source.cloneNode(true);
    clone.removeAttribute('class');
    clone.setAttribute('id', 'send-translation');
    clone._cloned = true;
    page.insertBefore(clone, source);

    const view = doc.getElementById('send-translation');
    const heading = view.querySelector('h2');

    heading.innerText = 'Send translation';
    heading.className = '';

    form = view.querySelector('form');

    load();
    page.addEventListener('unload', unload);
    view.removeAttribute('hidden');

    send_lock();
  }

  function page_reset() {
    const views = doc.querySelectorAll('main');

    for (const view of views) {
      if (view._cloned) {
        view.remove();
      }

      view.setAttribute('hidden', '');
    }

    window.scrollTo(window.scrollX, 0);
  }

  function load() {
    doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    render_form();
  }

  function unload() {
    form.removeEventListener('submit', submit);
    page.removeEventListener('unload', unload);
  }

  allowSubmit();
}

function form_submit() {
  const form = document.querySelector('.submit-form');

  function submit(evt) {
    const el = evt.target;

    if (el.nodeName == 'BUTTON' && el.type == 'button') {
      send_translation();
    }
  }

  form.addEventListener('click', submit);
}

function send_lock() {
  try {
    localStorage.setItem('_lock', 'send');
  } catch (err) {
    console.error('send_lock', err);
  }
}

function send_unlock() {
  try {
    localStorage.removeItem('_lock');
  } catch (err) {
    console.error('send_unlock', err);
  }
}

function send_resume() {
  try {
    if (localStorage.getItem('_lock') == 'send') {
      window.addEventListener('load', send_translation);
    }
  } catch (err) {
    console.error('send_resume', err);
  }
}

function get_token() {
  var w = 10;
  const a = [
    [ 48, 57 ],         // 0-9
    [ 97, 122 ],        // a-z
    [ 65, 90 ],         // A-Z
    [ 36, 38, 61, 64 ]  // $,&,=,@
  ];
  var s = '';

  while (w--) {
    let n;
    let i = Math.floor(Math.random() * 4);
    if (i == 3 && Math.random() * 100 < 50) {
      i = parseInt(Math.random() * 3);
    }
    if (i == 3) {
      n = Math.floor(Math.random() * a[i].length);
      n = a[i][n];
    } else {
      n = Math.floor((Math.random() * (a[i][1] - a[i][0] + 1)) + a[i][0]);
    }
    s += String.fromCharCode(n);
  }

  return s;
}

form_submit();
send_resume();
