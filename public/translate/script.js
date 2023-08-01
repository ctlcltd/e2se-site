/*!
 * translate/script.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */
(function() {


const basepath = '/translate';
const apipath = '/api';
const sourcespath = '/sources';
const routes = {
  '' : { '': main },
  'edit.html': { '': edit_translate },
  'add-language.html': { '': add_language }
};


function main() {
  console.log('main()');

  const doc = document;
  doc.title = 'E2SE Translations';
  doc.description.setAttribute('content', 'Translation website for e2 SAT Editor');

  const view = doc.getElementById('main');

  const fields = {
    'locale': 'Language',
    'name': 'Name',
    'tr_name': 'Translated name',
    'completed': 'Completed',
    'revised': 'Revised'
  };

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  function actionEdit(evt) {
    evt && evt.preventDefault();

    route(this.dataset.href);

    return false;
  }

  function allowSubmit() {
    try {
      let storage;
      for (const lang in languages) {
        if (storage = localStorage.getItem(lang)) {
          storage = JSON.parse(storage);
          if (storage.length > 1) {
            doc.getElementById('ctrbar-submit-form').removeAttribute('hidden');
            doc.querySelector('.submit-form').classList.remove('placeholder');
            break;
          }
        }
      }
    } catch (err) {
      console.error('allowSubmit', err);
    }
  }

  function render_row(td, field, text) {
    if (field == 'completed') {
      if (! td._element) {
        const level = doc.createElement('span');
        level.className = 'level';
        level.title = text.toString() + '%';
        level.dataset.completed = text.toString();
        level.style = '--completed: ' + text.toString() + '%;';
        td.append(level);
        td._element = level;
      }
    } else if (field == 'revised') {
      td.innerText = text ? 'yes' : 'none';
    } else if (text) {
      td.innerText = text.toString();
    }
  }

  function animation() {
    var i = tbody.rows.length;

    while (i--) {
      tbody.rows.item(i).removeAttribute('data-animated');
      tbody.rows.item(i).style = '--delay: ' + (i * 20) + 'ms;';
    }
  }

  function render_table(data) {
    const tr_loading = tbody.firstElementChild;
    const tr_tpl = tbody.querySelector('tr.placeholder');

    if (! thead.hasAttribute('data-rendered')) {
      for (const field in fields) {
        const th = doc.createElement('th');
        th.innerText = fields[field] ?? field;
        thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
      }
      thead.setAttribute('data-rendered', '');
    }

    for (const idx in data) {
      const guid = data[idx]['guid'].toString();
      const lang_code = data[idx]['code'].toString();
      const lang_type = data[idx]['type'].toString();
      const lang_dir = data[idx]['dir'].toString();

      const el_tr = tbody.querySelector('[data-guid="' + guid + '"]');
      const tr = el_tr ? el_tr : doc.createElement('tr');

      for (const field in fields) {
        if (field in fields) {
          const text = data[idx][field];

          const i = Object.keys(fields).indexOf(field);
          const el_td = tr.children.item(i);

          const td = el_td ?? doc.createElement('td');

          if (! td.hasAttribute('data-rendered')) {
            td._parent = tr;
            render_row(td, field, text);
            td.setAttribute('data-rendered', '');
          } else if (field in data[idx]) {
            render_row(td, field, text);
          }

          if (! el_td) {
            tr.append(td);
          }
        }
      }

      if (! el_tr) {
        if (tr_tpl) {
          for (const td of tr_tpl.children) {
            if (td != tr_tpl.firstElementChild) {
              tr.append(td.cloneNode(true));
            }
          }
        }

        const action_edit = tr.querySelector('span.action-edit > a');
        action_edit.href += '?lang=' + lang_code;
        tr.setAttribute('data-guid', guid);
        tr.setAttribute('data-type', lang_type);
        tr.setAttribute('data-dir', lang_dir);
        tr.setAttribute('data-href', action_edit.href);
        tr.setAttribute('data-animated', '');
        tr.onclick = actionEdit;

        tbody.append(tr);
      }
    }

    if (tr_tpl) {
      tr_tpl.remove();
    }
    tr_loading.remove();
    table.removeAttribute('data-loading');
    table.classList.remove('placeholder');
    table.setAttribute('data-rendered', '');
  }

  function load() {
    doc.getElementById('ctrbar-add-language').removeAttribute('hidden');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    if (! languages) {
      return false;
    }
    if (! table.hasAttribute('data-rendered')) {
      table.setAttribute('data-loading', '');
      render_table(languages);
    }
    allowSubmit();
    setTimeout(function() {
      animation();
    }, 300);
  }

  load();
  view.removeAttribute('hidden');
}


function edit_translate(uri, key, value) {
  console.log('edit_translate()');

  const doc = document;
  doc.title = 'Edit - E2SE Translations';
  doc.description.setAttribute('content', 'Edit translation strings of a language');

  const page = doc.getElementById('page');
  const source = doc.querySelector('.view-list');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'edit-translate');
  clone.cloned = true;
  page.insertBefore(clone, source);

  const view = doc.getElementById('edit-translate');
  const heading = view.querySelector('h2');

  const fields = {
    'ctx_name': 'Node',
    'msg_src': 'Source',
    'msg_tr': 'Translation',
    'disambigua': 'Disambigua',
    'notes': 'Notes',
    'msg_extra': 'Comment',
    'msg_comment': 'Context',
    'status': 'Status'
  };
  const notes = {
    '0': 'No translate',
    '1': 'Maybe wrong', // type: 1
    '2': 'Maybe wrong', // type: 2
    '3': 'Maybe wrong',
    '6': 'System string | Maybe wrong',
    '8': 'Conventional | Maybe wrong'
  };

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  let disambigua = {};

  const lang = value.split('=')[1];
  let lang_code;
  let lang_type;
  let lang_dir;

  const ts_src = 'src';
  const tr_src = lang + '-tr';
  const tr_key = 'tr-' + lang;

  if (languages && languages[lang]) {
    lang_code = languages[lang]['code'].toString();
    lang_type = languages[lang]['type'].toString();
    lang_dir = languages[lang]['dir'].toString();

    heading.innerText = 'Edit ' + languages[lang]['name'];
    heading.className = '';
    table.setAttribute('data-lang', lang_code);
    table.setAttribute('data-type', lang_type);
    table.setAttribute('data-dir', lang_dir);
  }

  let storage = localStorage.getItem(tr_key);

  try {
    if (storage) {
      storage = JSON.parse(storage);
    } else {
      storage = {};
    }
  } catch (err) {
    storage = {};
    console.error(err);
  }

  const request = source_request(ts_src);

  function disambiguation(data) {
      if (Object.keys(disambigua).length == 0) {
        for (const idx in data) {
          const guid = data[idx]['guid'];
          disambigua[guid] = idx;
        }
      }
  }

  function scrollToRow(evt) {
    const el = evt.target;

    if (el.hasAttribute('data-scroll-row')) {
      const idx = el.getAttribute('data-scroll-row');
      const i = parseInt(idx) - 1;
      const tr = tbody.rows.item(i);
      const offset = tr.previousElementSibling ? tr.previousElementSibling.offsetTop : tr.offsetTop;

      scrollTo(0, offset);
      tr.classList.add('highlight');
      setTimeout(function() {
        tr.classList.remove('highlight');
      }, 2e3);
    }
  }

  function toggler(evt) {
    const el = evt.target;

    if (el.classList.contains('toggler')) {
      if (el.nextElementSibling.hasAttribute('hidden')) {
        el.nextElementSibling.removeAttribute('hidden');
        el.classList.add('opened');
      } else {
        el.nextElementSibling.setAttribute('hidden', '');
        el.classList.remove('opened');
        setTimeout(function() {
          el.blur();
        }, 100);
      }
    } else {
      doc.querySelectorAll('.toggler').forEach(function(el) {
        if (! el.nextElementSibling.hasAttribute('hidden')) {
          el.nextElementSibling.setAttribute('hidden', '');
          el.classList.remove('opened');
          setTimeout(function() {
            el.blur();
          }, 100);
        }
      });
    }
  }

  function textInput(evt) {
    const el = evt.target;

    if (el.classList.contains('input')) {
      const tr = el.parentElement.closest('[data-guid]');

      try {
        const guid = tr.dataset.guid;
        if (el.srcText != '' && el.srcText === el.textContent) {
          delete storage[guid];
        } else {
          storage[guid] = el.textContent;
        }
        localStorage.setItem(tr_key, JSON.stringify(storage));
      } catch (err) {
        console.error('textInput', err);
      }
    }
  }

  function allowSubmit(evt) {
    if (storage.length > 1) {
      doc.getElementById('ctrbar-submit-form').removeAttribute('hidden');
      doc.querySelector('.submit-form').classList.remove('placeholder');
    }
  }

  function render_row(td, field, obj) {
    if (field == 'msg_tr') {
      if (td._element) {
        const guid = td._parent.dataset.guid;
        const input = td._element;
        if (storage[guid]) {
          input.srcText = obj.toString();
          input.innerText = storage[guid];
          input.dataset.changed = '';
        } else {
          input.innerText = input.srcText = obj.toString();
        }
      } else {
        const input = doc.createElement('span');
        input.className = 'input inline-edit';
        input.contentEditable = 'plaintext-only';
        input.dir = lang_dir;
        // input.innerText = obj ? obj.toString() : '';
        td.append(input);
        td._element = input;
      }
    } else if (field == 'disambigua') {
      if (! td._element && obj && typeof obj === 'object' && Object.keys(obj).length != 0) {
        const toggler = doc.createElement('button');
        toggler.className = 'toggler';
        toggler.type = 'button';
        toggler.innerText = Object.keys(obj).length;
        const list = doc.createElement('ul');
        const dropdown = doc.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.setAttribute('hidden', '');
        dropdown.append(list);

        td.append(toggler);
        td.append(dropdown);
        td._element = toggler;

        for (const guid of obj) {
          const i = disambigua[guid];
          const item = doc.createElement('li');
          const anchor = doc.createElement('a');
          anchor.href = 'javascript:';
          anchor.innerText = i.toString();
          anchor.setAttribute('data-scroll-row', i);
          item.append(anchor);
          list.append(item);
        }
      }
    } else if (field == 'status') {
      if (td._element) {
        const status = td._element;
        if (obj !== '') {
          let text;
          if (obj == 0) {
            text = 'unfinished';
          } else if (obj == 1) {
            text = 'completed';
          } else if (obj == 2) {
            text = 'vanished';
          }
          status.className += ' status-' + text;
          status.innerText = text;
        }
      } else {
        const status = doc.createElement('span');
        status.className = 'status';
        td.append(status);
        td._element = status;
      }
    } else if (field == 'msg_extra') {
      if (obj) {
        let text = obj.toString();
        text = text.replace(' | ', '\n');
        td.innerText = text.toString();
      }
    } else if (field == 'notes') {
      if (obj) {
        if (obj in notes) {
          // td._parent.setAttribute('data-notes', obj);
          td.innerText = notes[obj].replace(' | ', '\n');
        } else {
          td.innerText = obj.toString();
        }
      }
    } else if (obj) {
      td.innerText = obj.toString();
    }
  }

  function render_table(data) {
    const tr_loading = tbody.firstElementChild;
    const tr_tpl = tbody.querySelector('tr.placeholder');

    if (! thead.hasAttribute('data-rendered')) {
      for (const field in fields) {
        const th = doc.createElement('th');
        th.innerText = fields[field] ?? field;
        thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
      }
      thead.setAttribute('data-rendered', '');
    }

    for (const idx in data) {
      const guid = data[idx]['guid'].toString();
      // completed + revised

      const el_tr = tbody.querySelector('[data-guid="' + guid + '"]');
      const tr = el_tr ?? doc.createElement('tr');

      for (const field in fields) {
        if (field in fields) {
          const obj = data[idx][field];

          const i = Object.keys(fields).indexOf(field);
          const el_td = tr.children.item(i);

          const td = el_td ?? doc.createElement('td');

          if (! td.hasAttribute('data-rendered')) {
            td._parent = tr;
            render_row(td, field, obj);
            td.setAttribute('data-rendered', '');
          } else if (field in data[idx]) {
            render_row(td, field, obj);
          }

          if (! el_td) {
            tr.append(td);
          }
        }
      }

      if (! el_tr) {
        if (tr_tpl) {
          for (const td of tr_tpl.children) {
            tr.append(td.cloneNode(true));
          }
        }

        tr.setAttribute('data-guid', guid);
        tr.title = parseInt(idx) + 1;

        tbody.append(tr);
      }
    }

    if (tr_tpl) {
      tr_tpl.remove();
    }
    tr_loading.remove();
    table.removeAttribute('data-loading');
    table.classList.remove('placeholder');
  }

  function loader(xhr, begin) {
    try {
      const obj = JSON.parse(xhr.response);

      if (begin) {
        disambiguation(obj);
      }
      render_table(obj);
      if (! begin) {
        allowSubmit();
      }
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    // console.warn(xhr);
  }

  function load() {
    doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    table.setAttribute('data-loading', '');
    request.then(function(xhr) {
      loader(xhr, true);
      if (true) {
        const request = source_request(tr_src);
        request.then(loader).catch(error);
      } else {
        loader(xhr);
      }
    }).catch(error);

    tbody.addEventListener('click', toggler);
    tbody.addEventListener('click', scrollToRow);
    tbody.addEventListener('input', textInput);
    tbody.addEventListener('blur', allowSubmit);
  }

  function unload() {
    tbody.removeEventListener('click', toggler);
    tbody.removeEventListener('click', scrollToRow);
    tbody.removeEventListener('input', textInput);
    tbody.removeEventListener('blur', allowSubmit);
    page.removeEventListener('unload', unload);
  }

  load();
  page.addEventListener('unload', unload);
  view.removeAttribute('hidden');
}


function add_language(uri, key, value) {
  console.log('add_language()');

  const doc = document;
  doc.title = 'Add language - E2SE Translations';
  doc.description.setAttribute('content', 'Add a new language to translations');

  const page = doc.getElementById('page');
  const source = doc.querySelector('.view-edit');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'add-language');
  clone.cloned = true;
  page.insertBefore(clone, source);

  const view = doc.getElementById('add-language');
  const heading = view.querySelector('h2');

  const fields = {
    'lang_code': 'ISO 639-1 language code (eg. xz)',
    'lang_locale': 'Locale language code (eg. xz_XA)',
    'lang_dir': 'Direction',
    'lang_name': 'Name',
    'lang_tr_name': 'Translated name',
    'lang_numerus': 'Numerus'
  };
  const data = {
    'lang_code': {'pattern': '[a-z]{2}', 'required': true},
    'lang_locale': {'pattern': '[a-z]{2}_[A-Z]{2}', 'required': true},
    'lang_dir': {'type': 'select', 'options': {'ltr': 'LTR (Left To Right)', 'rtl': 'RTL (Right To Left)'}, 'required': true},
    'lang_name': {'required': true},
    'lang_tr_name': {'required': true},
    'lang_numerus': {'type': 'number'}
  };

  heading.innerText = 'Add new language';
  heading.className = '';

  const form = view.querySelector('form');
  const fieldset_lh = form.firstElementChild;

  function submit(evt) {
    const form = this;

    let obj = {};

    for (const input of form.elements) {
      if (input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA' || input.nodeName == 'SELECT') {
        if (input.name != '') {
          obj[input.name] = input.value;
        }
      }
    }

    const lang = obj.lang_code;
    let storage = localStorage.getItem('languages');

    try {
      if (storage) {
        storage = JSON.parse(storage);
      } else {
        throw 'Storage Error';
      }
      if (lang in storage) {
        // 
        throw 'Language already exists';
      }
    } catch (err) {
      console.error('submit', err);
      return;
    }

    const language = {
      'guid': '',
      'code': obj.lang_code,
      'locale': obj.lang_locale,
      'name': obj.lang_name,
      'tr_name': obj.lang_tr_name,
      'dir': obj.lang_dir,
      'type': 0,
      'numerus': parseInt(obj.lang_numerus),
      'completed': 0,
      'revised': 0
    };

    try {
      storage[lang] = language;
      localStorage.setItem('languages', JSON.stringify(storage));
      route('');
    } catch (err) {
      console.error('submit', err);
    }
  }

  function submit_form(evt) {
    const form = this;

    evt.preventDefault();

    if (! form.hasAttribute('novalidate') && 'checkValidity' in form && typeof form.checkValidity === 'function') {
      if (form.checkValidity() === true) {
        submit.call(form, evt);
      }
    } else {
      let pass = true;

      for (const input of form.elements) {
        if (input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA' || input.nodeName == 'SELECT') {
          let valid = false;
          let message = 'Required field';
          if (input.nextElementSibling && input.nextElementSibling.classList.contains('novalid')) {
            input.nextElementSibling.remove();
          }
          if (input.hasAttribute('pattern')) {
            const pattern = input.getAttribute('pattern');
            const regex = new RegExp(pattern);

            if (input.hasAttribute('required') && input == '') {
              input.classList.add('novalid');
            } else if (regex && regex.test(input.value) === true) {
              input.classList.remove('novalid');
              valid = true;
            } else {
              input.classList.add('novalid');
              message = 'No valid input';
            }
          } else if (input.hasAttribute('required')) {
            if (input.value != '') {
              input.classList.remove('novalid');
              valid = true;
            } else {
              input.classList.add('novalid');
            }
          } else {
            valid = true;
          }
          if (! valid) {
            pass = false;
            const node = doc.createElement('span');
            node.className = 'novalid';
            node.innerText = message;
            input.parentElement.append(node);
          }
        }
      }

      if (pass) {
        submit.call(form, evt);
      }
    }
  }

  function reset_form(evt) {
    const form = this;

    if (! form.hasAttribute('novalidate') && 'checkValidity' in form && typeof form.checkValidity === 'function') {
    } else {
      evt.preventDefault();

      for (const input of form.elements) {
        if (input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA' || input.nodeName == 'SELECT') {
          input.classList.remove('novalid');
          if (input.nextElementSibling && input.nextElementSibling.classList.contains('novalid')) {
            input.nextElementSibling.remove();
          }
        }
      }

      form.reset();
    }
  }

  function render_label(field, obj) {
    const label = doc.createElement('label');
    label.innerText = obj ?? field;
    return label;
  }

  function render_input(field, obj) {
    let input;
    if (obj) {
      if (typeof obj == 'object') {
        if (obj.type == 'select') {
          input = doc.createElement('select');
          input.name = field;

          for (const option in obj.options) {
            const sub = doc.createElement('option');
            sub.value = option;
            sub.innerText = obj.options[option];
            input.append(sub);
          }
        } else if (obj.type == 'textarea') {
          input = doc.createElement('textarea');
          input.name = field;
        } else {
          input = doc.createElement('input');
          input.name = field;
          input.setAttribute('type', 'text');
        }

        if (obj.pattern) {
          input.setAttribute('pattern', obj.pattern);
        }
        if (obj.required) {
          input.setAttribute('required', '');
        }
      }
    } else {
      input = doc.createElement('input');
      input.setAttribute('type', 'text');
      input.name = field;
    }
    return input;
  }

  function render_form(data) {
    const fieldset = doc.createElement('fieldset');

    for (const field in data) {
      const obj = data[field];

      const div = doc.createElement('div');

      const label = render_label(field, fields[field]);
      const input = render_input(field, obj);

      div.append(label);
      div.append(input);

      fieldset.append(div);

      form.insertBefore(fieldset, fieldset_lh);
    }

    form.classList.remove('placeholder');
    form.addEventListener('submit', submit_form);
    form.addEventListener('reset', reset_form);
  }

  function load() {
    doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    render_form(data);
  }

  function unload() {
    form.removeEventListener('submit', submit_form);
    form.removeEventListener('reset', reset_form);
    page.removeEventListener('unload', unload);
  }

  load();
  page.addEventListener('unload', unload);
  view.removeAttribute('hidden');
}


function styles() {
  const what_this_areas = document.querySelectorAll('.what-this-area');
  if (what_this_areas.length) {
    for (const el of what_this_areas) {
      el.removeAttribute('hidden');
    }
  }
}

styles();

function token() {
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
      i -= parseInt(Math.random() * 3);
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

window.token = token;


function api_request(method, endpoint, body) {
  const xhr = new XMLHttpRequest();
  let url = apipath + endpoint;

  if (url.substr(-1) != '/') {
    url += '/';
  }

  if (body && method === 'get') {
    url += '?' + body;
    body = null;
  }

  xhr.open(method, url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(body);

  return new Promise(function(resolve, reject) {
    xhr.onload = function() { resolve(xhr); };
    xhr.onerror = function() { reject(xhr); };
  });
}


function source_request(name) {
  const xhr = new XMLHttpRequest();
  const filename = 'e2se-ts-' + name + '.json';
  const url = sourcespath + '/' + filename;

  xhr.open('get', url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send();

  return new Promise(function(resolve, reject) {
    xhr.onload = function() { resolve(xhr); };
    xhr.onerror = function() { reject(xhr); };
  });
}


function route(href, title) {
  const page = document.getElementById('page');
  const views = document.querySelectorAll('main');
  const history = href ? true : false;

  href = href ?? window.location.href;
  title = title ?? document.title;

  if (href.indexOf(basepath) === -1) {
    throw 'Wrong base path';
  }

  const url = href.replace(window.location.protocol + '//' + window.location.host, '');
  const path = url.split('?');
  const uri = path[0].split('/')[2];
  const qs = path[1] ? path[1].split('&') : '';
  const key = '';
  const value = qs[0] ?? '';

  // console.info('route()', { path, uri, qs, key, value });

  for (const view of views) {
    if (view.cloned) {
      view.remove();
    }

    view.setAttribute('hidden', '');
  }

  if (uri != undefined && uri in routes === false) {
    throw 'Wrong URI Route';
  }
  if (key != undefined && key in routes[uri] === false) {
    throw 'Wrong QueryString Route';
  }
  if (typeof routes[uri][key] != 'function') {
    throw 'No Function Route';
  }

  const e = new Event('unload');
  page.dispatchEvent(e);

  if (history) {
    window.history.pushState('', title, url);
  }

  routes[uri][key].call(this, uri, key, value);
}


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

})();