/*
 * translate/add_language.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

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
