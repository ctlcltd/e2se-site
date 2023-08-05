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
  '' : main,
  'edit.html': edit_translate,
  'add-language.html': add_language
};


function main() {
  console.log('main()');

  const doc = document;
  doc.title = 'Translations';
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
    if (! doc.getElementById('ctrbar-submit-form').hasAttribute('hidden')) {
      return;
    }
    try {
      let storage;
      for (const lang in languages) {
        const tr_key = 'tr-' + lang;
        if (storage = localStorage.getItem(tr_key)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length > 1) {
            doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
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


function edit_translate(uri, search) {
  console.log('edit_translate()');

  const doc = document;
  const body = doc.body;
  doc.title = 'Edit - Translations';
  doc.description.setAttribute('content', 'Edit translation strings of a language');

  const page = doc.getElementById('page');
  const source = doc.querySelector('.edit-translate');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'edit-translate');
  clone._cloned = true;
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
    '1': 'Maybe wrong', // type I
    '2': 'Maybe wrong', // type II
    '3': 'Maybe wrong',
    '6': 'System string | Maybe wrong',
    '8': 'Conventional | Maybe wrong'
  };

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  let disambigua = {};

  const lang = search['lang'];
  let lang_code;
  let lang_type;
  let lang_dir;
  let lang_user;

  const ts_src = 'src';
  const tr_src = lang + '-tr';
  const tr_key = 'tr-' + lang;

  if (languages && languages[lang]) {
    lang_code = languages[lang]['code'].toString();
    lang_type = languages[lang]['type'].toString();
    lang_dir = languages[lang]['dir'].toString();
    lang_user = languages[lang]['guid'] ? false : true;

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

  const _textInput = debounce(textInput, false, 50);

  function allowSubmit(evt) {
    console.log('allowSubmit');

    if (doc.getElementById('ctrbar-submit-form').hasAttribute('hidden') && Object.keys(storage).length > 1) {
      doc.getElementById('ctrbar-submit-form').removeAttribute('hidden');
      doc.querySelector('.submit-form').classList.remove('placeholder');
    } else {
      try {
        let storage;
        for (const lang in languages) {
          const tr_key = 'tr-' + lang;
          if (storage = localStorage.getItem(tr_key)) {
            storage = JSON.parse(storage);
            if (Object.keys(storage).length > 1) {
              message('edit-prev');
              break;
            }
          }
        }
      } catch (err) {
        console.error('allowSubmit', err);
      }
    }
  }

  const _allowSubmit = debounce(allowSubmit, true);

  function scrollBody(evt) {
    if (window.pageYOffset > 300) {
      body.classList.add('ndm');
    } else {
      body.classList.remove('ndm');
    }
  }

  const _scrollBody = debounce(scrollBody, false);

  function render_row(td, field, obj) {
    if (field == 'msg_tr') {
      if (td._element) {
        if (obj) {
          const guid = td._parent.dataset.guid;
          const input = td._element;
          if (storage[guid]) {
            input.srcText = obj.toString();
            input.innerText = storage[guid];
            input.dataset.changed = '';
          } else {
            input.innerText = input.srcText = obj.toString();
          }
        }
      } else {
        const input = doc.createElement('span');
        input.className = 'input inline-edit';
        input.contentEditable = 'plaintext-only';
        input.dir = lang_dir;
        td.append(input);
        td._element = input;
      }
    } else if (field == 'disambigua') {
      if (! td._element && obj) {
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
        let text;
        if (obj) {
          if (obj == 0) {
            text = 'unfinished';
          } else if (obj == 1) {
            text = 'completed';
          } else if (obj == 2) {
            text = 'vanished';
          }
        } else {
          text = 'unfinished';
        }
        status.className += ' status-' + text;
        status.innerText = text;
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
      if (obj && (lang_user && obj == '0' || ! lang_user)) {
        if (obj in notes) {
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
          } else if (field == 'msg_tr' && storage[guid]) {
            render_row(td, field, storage[guid]);
          } else if (field in data[idx] || lang_user) {
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

  function loader(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      disambiguation(obj);
      render_table(obj);
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);
  }

  function load() {
    doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    table.setAttribute('data-loading', '');
    request.then(function(xhr) {
      loader(xhr);

      if (! lang_user) {
        const request = source_request(tr_src);
        request.then(loader).catch(error);
      } else {
        loader(xhr);
      }

      scrollBody();
      allowSubmit();
    }).catch(error);

    tbody.addEventListener('click', toggler);
    tbody.addEventListener('click', scrollToRow);
    tbody.addEventListener('input', _textInput);
    tbody.addEventListener('input', _allowSubmit);
    window.addEventListener('scroll', _scrollBody);
  }

  function unload() {
    body.classList.remove('dnm');
    tbody.removeEventListener('click', toggler);
    tbody.removeEventListener('click', scrollToRow);
    tbody.removeEventListener('input', _textInput);
    tbody.removeEventListener('input', _allowSubmit);
    window.removeEventListener('scroll', _scrollBody);
    page.removeEventListener('unload', unload);
  }

  load();
  page.addEventListener('unload', unload);
  view.removeAttribute('hidden');
}


function add_language(uri, search) {
  console.log('add_language()');

  const doc = document;
  doc.title = 'Add language - Translations';
  doc.description.setAttribute('content', 'Add a new language to translations');

  const page = doc.getElementById('page');
  const source = doc.querySelector('.add-language');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'add-language');
  clone._cloned = true;
  page.insertBefore(clone, source);

  const view = doc.getElementById('add-language');
  const heading = view.querySelector('h2');

  const fields = {
    'lang_code': 'ISO 639-1 language code (eg. xz)',
    'lang_locale': 'Locale language code (eg. xz_XA)',
    'lang_dir': 'Text directionality',
    'lang_type': 'Text type',
    'lang_name': 'Name',
    'lang_tr_name': 'Translated name',
    'lang_numerus': 'Numerus'
  };
  const data = {
    'lang_code': {'pattern': '[a-z]{2}', 'required': true},
    'lang_locale': {'pattern': '[a-z]{2}_[A-Z]{2}', 'required': true},
    'lang_type': {'type': 'select', 'options': {1: 'Type I (latin / ASCII)', 2: 'Type II (other alphabet)'}, 'required': true},
    'lang_dir': {'type': 'select', 'options': {'ltr': 'LTR (Left To Right)', 'rtl': 'RTL (Right To Left)'}, 'required': true},
    'lang_name': {'required': true},
    'lang_tr_name': {'required': true},
    'lang_numerus': {'type': 'number', 'min': 1, 'max': 8, 'default': 1}
  };

  heading.innerText = 'Add new language';
  heading.className = '';

  const form = view.querySelector('form');

  function allowSubmit(evt) {
    console.log('allowSubmit');

    try {
      let storage;
      for (const lang in languages) {
        const tr_key = 'tr-' + lang;
        if (storage = localStorage.getItem(tr_key)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length > 1) {
            message('edit-prev');
            break;
          }
        }
      }
    } catch (err) {
      console.error('allowSubmit', err);
    }
  }

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
        message('lang-exists');

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

      form.setAttribute('data-loading', '');

      setTimeout(function() {
        form.removeAttribute('data-loading');

        // FIXME
        // Wrong base path
        route('');
      }, 300);
    } catch (err) {
      console.error('submit', err);
    }
  }

  function submitForm(evt) {
    const form = this;
    let pass;

    evt.preventDefault();

    if (! form.hasAttribute('novalidate') && 'checkValidity' in form && typeof form.checkValidity === 'function') {
      pass = form.checkValidity();
    } else {
      for (const input of form.elements) {
        if (input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA' || input.nodeName == 'SELECT') {
          let valid = false;
          let message = 'Required field';
          if (input.nextElementSibling && input.nextElementSibling.classList.contains('novalid')) {
            input.nextElementSibling.remove();
          }

          const type = input.getAttribute('type');
          let pattern;

          if (input.hasAttribute('pattern')) {
            pattern = input.getAttribute('pattern');
          } else if (input.nodeName == 'INPUT' && (type == 'number' || type == 'range')) {
            pattern = '^[0-9]$';
          }

          if (pattern && input.value != '') {
            const regex = new RegExp(pattern);

            if (regex && regex.test(input.value) === true) {
              valid = true;
            } else {
              message = 'No valid input';
            }
          } else if (input.hasAttribute('required') && input.value != '') {
            valid = true;
          } else {
            valid = true;
          }

          if (valid) {
            input.classList.remove('novalid');

            pass = true;
          } else {
            input.classList.add('novalid');

            pass = false;
            const node = doc.createElement('span');
            node.className = 'novalid';
            node.innerText = message;
            input.parentElement.append(node);
          }
        }
      }
    }

    if (pass) {
      submit.call(form, evt);
    }
  }

  function resetForm(evt) {
    const form = this;
    let novalidate;

    if (! form.hasAttribute('novalidate') && 'checkValidity' in form && typeof form.checkValidity === 'function') {
      novalidate = false;
    } else {
      evt.preventDefault();

      novalidate = true;

      form.reset();
    }

    for (const input of form.elements) {
      if (input.nodeName == 'INPUT' || input.nodeName == 'TEXTAREA' || input.nodeName == 'SELECT') {
        if (novalidate) {
          input.classList.remove('novalid');
          if (input.nextElementSibling && input.nextElementSibling.classList.contains('novalid')) {
            input.nextElementSibling.remove();
          }
        }

        if (input._value) {
          input.setAttribute('value', input._value);
        }
      }
    }
  }

  function render_label(field, obj) {
    const label = doc.createElement('label');
    label.innerText = obj ?? field;
    return label;
  }

  function render_input(field, obj, value) {
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
          input.setAttribute('type', obj.type);

          if (obj.min) {
            input.setAttribute('min', parseInt(obj.min));
          }
          if (obj.max) {
            input.setAttribute('max', parseInt(obj.max));
          }
          if (obj.step) {
            input.setAttribute('step', parseInt(obj.step));
          }
        }

        if (obj.placeholder) {
          input.setAttribute('placeholder', obj.placeholder);
        }
        if (obj.pattern) {
          input.setAttribute('pattern', obj.pattern);
        }
        if (obj.required) {
          input.setAttribute('required', '');
        }
        if (obj.readonly) {
          input.setAttribute('readonly', '');
        }

        if (value) {
          input.value = input._value = value;
        } else if (obj.default) {
          input.value = input._value = obj.default;
        }
        if (input._value && obj.type != 'select' && obj.type != 'textarea') {
          input.setAttribute('value', input._value);
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

      form.insertBefore(fieldset, form.firstElementChild);
    }

    form.classList.remove('placeholder');
    form.addEventListener('submit', submitForm);
    form.addEventListener('reset', resetForm);
  }

  function load() {
    doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    render_form(data);
    allowSubmit();
  }

  function unload() {
    form.removeEventListener('submit', submitForm);
    form.removeEventListener('reset', resetForm);
    page.removeEventListener('unload', unload);
  }

  load();
  page.addEventListener('unload', unload);
  view.removeAttribute('hidden');
}


function send_translation() {
  console.log('send_translation()');

  const doc = document;
  const page = doc.getElementById('page');

  let form;

  function submit() {
    try {
      let storage;
      let translation;
      let lang_code;
      let language;
      let user;

      for (const lang in languages) {
        if (storage = localStorage.getItem(lang)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length > 2) {
            translation = storage;
            lang_code = lang;
            break;
          }
        }
      }

      for (const lang in languages) {
        storage = JSON.parse(storage);
        for (const lang in storage) {
          if (! lang.guid) {
            if (lang.code === lang_code) {
              language = lang;
            } else {
              translation = null;
            }
            break;
          }
        }
      }

      if (! translation) {
        throw 'Not a valid translation submit';
      }

      let data;

      if (language) {
        data['language'] = language;
      } else if (lang_code) {
        data['lang'] = lang_code;
      } else {
        throw 'Not a valid submit';
      }

      data['translation'] = translation;

      const input = form.querySelector('[name="send_user"]');

      if (input.value) {
        data['user'] = input.value;
      }

      const token = token();
      const request = api_request('post', 'userland', 'submit', 'token=' + token + '&data=' + JSON.stringify(data));

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
      route();
    }
  }

  function sent(xhr) {
    form.removeAttribute('data-loading');

    try {
      const obj = JSON.parse(xhr.response);

      if (obj.token && validate_token(obj.token)) {
        localStorage.clear();

        localStorage.setItem('_time', new Date().toJSON());
        localStorage.setItem('_token', 1);
        localStorage.setItem('your-token', obj.token);

        message('your-token');
      } else {
        throw 'An error occurred';
      }
    } catch (err) {
      console.error('loader', err);
    }

    send_unlock();
    route();
  }

  function error(xhr) {
    console.warn(xhr);

    form.removeAttribute('data-loading');

    message('send-error');

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


function resume_translation() {
  const doc = document;
  const page = doc.getElementById('page');

  const request = api_request('post', 'userland', 'token=' + token);

  function loader(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      if (obj.data) {
        const data = obj.data;

        // 

        if (data.ulang) {

        }
        if (data.utr) {

        }
      } else {
        throw 'An error occurred';
      }

      localStorage.setItem('languages', JSON.stringify(languages));
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);
  }

  page.setAttribute('data-loading', '');
  request.then(loader).catch(error);
  page.removeAttribute('data-loading');
}

function form_token() {
  const doc = document;
  const form = doc.querySelector('.token-form');
  const field = form.querySelector('#token');

  function textInput(evt) {
    const el = evt.target;

    if (el.value.length === 10 && validate_token(el.value)) {
      el.setAttribute('disabled', '');
      resume_translation();
      el.removeAttribute('disabled');
    }
  }

  const _textInput = debounce(textInput, false, 50);

  field.addEventListener('input', _textInput);
}

function your_token() {
  try {
    if (localStorage.getItem('_token')) {
      message('your-token');
    }
  } catch (err) {
    console.error('your_token', err);
  }
}

function token_box_html() {
  try {
    const token = localStorage.getItem('your-token');

    if (! validate_token(token)) {
      throw 'Not a valid token';
    }

    // 
    return '<p>Your token</p><div><input type="text" id="your-token" value="' + token + '" readonly></div>';
  } catch (err) {
    console.error('token_box_html', err);
  }
}

function token_box_dismiss() {
  try {
    localStorage.removeItem('_token');
  } catch (err) {
    console.error('token_box_dismiss', err);
  }
}

function validate_token(token) {
  return /[a-zA-Z$&=@]{10}/g.test(token);
}


function message(id, text, type, buttons) {
  const doc = document;
  const box = doc.createElement('div');

  function close() {
    doc.body.classList.remove('backdrop');
    msg = null;

    setTimeout(function() {
      box.remove();
    }, 150);
  }

  if (id) {
    let html;

    if (id == 'storage') {
      html = '<p><b>WebStorage is required</b></p><p>localStorage seems to be unavailable<br>Please reload your browser and try again</p>';
    } else if (id == 'lang-exists') {
      type = 0;
      html = '<p>Language already exists</p>';
    } else if (id == 'send-error') {
      type = 0;
      html = '<p><b>An error occurred<b></p><p>Please try again</p>';
    } else if (id == 'edit-prev') {
      type = 2;
      html = '<p>You have a previous translation edit that was not sent</p><p><b>Do you want to submit or discard the previous edit?</b></p>';
      buttons = [
        {'label': 'Submit', 'class': 'primary', 'callback': send_translation},
        {'label': 'Discard', 'class': 'secondary tiny', 'callback': discard_edit},
        {'label': 'Cancel', 'class': 'tiny', 'callback': close}
      ];
    } else if (id == 'your-token') {
      type = 1;
      html = token_box_html();
      buttons = [
        {'label': 'Dismiss', 'class': 'secondary tiny', 'callback': token_box_dismiss}
      ];
    }

    box.innerHTML = html;
  } else if (text) {
    box.innerText = text;
  } else {
    return;
  }

  box.className = 'message-box';
  if (type === 0) {
    box.className += ' error';
  } else if (type === 1) {
    box.className += ' success';
  } else if (type === 2) {
    box.className += ' ask';
  }

  if (type != undefined) {
    doc.body.classList.add('backdrop');
    box.className += ' top';
    btns = [
      {'label': 'OK', 'callback': close}
    ];
  }

  if (buttons && typeof buttons == 'object') {
    const btns = doc.createElement('div');
    btns.className = 'feedback';

    for (const btn of buttons) {
      const button = doc.createElement('button');
      if (btn.class) {
        button.className += btn.class;
      }
      button.innerText = btn.label;
      if (btn.callback && typeof btn.callback == 'function') {
        button.onclick = function(evt) {
          close();
          btn.callback.call(this, evt);
        };
      }
      btns.append(button);
    }

    box.append(btns);
  }

  if (msg) {
    msg.replaceWith(box);
  } else {
    doc.body.append(box);
  }
  msg = box;
}

function what_this() {
  const what_this_areas = document.querySelectorAll('.what-this-area');
  if (what_this_areas.length) {
    for (const el of what_this_areas) {
      el.removeAttribute('hidden');
    }
  }
}

function discard_edit() {
  try {
    for (const lang in languages) {
      if (localStorage.getItem(lang)) {
        localStorage.removeItem(lang);
      }
    }
  } catch (err) {
    console.error('discard_edit', err);
  }
}

function debounce(fn, once, timeout) {
  timeout = timeout ?? 300;
  let timer;

  if (once) {
    return (function() {
      if (! timer) {
        fn.apply(this, arguments);
      }
      clearTimeout(timer);
      timer = setTimeout(function() {
        timer = undefined;
      }, timeout);
    });
  } else {
    return (function() {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(this, args);
      }, timeout);
    });
  }
}

what_this();


function api_request(method, endpoint, route, data) {
  const xhr = new XMLHttpRequest();
  let url = apipath + '/';
  let body = null;

  if (method === 'get') {
    if (endpoint) {
      url += '?data=' + endpoint;
    }
    if (route) {
      url += endpoint ? '&' : '?' + '&call=' + route;
    }
    if (data) {
      url += endpoint || route ? '&' : '?' + data;
    }
  } else if (method === 'post') {
    body = 'body=' + endpoint;

    if (route) {
      body += '&call=' + route;
    }
    if (data) {
      body += '&' + data;
    }
  } else {
    return new Promise(function(resolve, reject) {
      reject('Request Error');
    });
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
  const root = url.split('?');
  const uri = root[0].split('/')[2];
  const qs = root[1] ? root[1].split('&') : '';
  let search = {};

  if (qs) {
    for (let c of qs) {
      c = c.split('=');
      search[c[0]] = c[1];
    }
  }

  console.info('route', { qs, uri, search });

  for (const view of views) {
    if (view._cloned) {
      view.remove();
    }

    view.setAttribute('hidden', '');
  }

  if (uri != undefined && uri in routes === false) {
    throw 'Wrong URI Route';
  }
  if (typeof routes[uri] != 'function') {
    throw 'No Function Route';
  }

  const e = new Event('unload');
  page.dispatchEvent(e);

  if (history) {
    window.history.pushState('', title, url);
  }

  routes[uri].call(this, uri, search);
}


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

})();