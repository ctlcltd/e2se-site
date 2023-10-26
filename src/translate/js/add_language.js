/*
 * translate/add_language.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

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
            message('editprev');
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
        throw except(2);
      }
      if (lang in storage) {
        message('langexists');

        throw except(13);
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
      'type': obj.lang_type,
      'numerus': parseInt(obj.lang_numerus),
      'completed': 0,
      'revised': 0
    };

    try {
      storage[lang] = language;
      localStorage.setItem('languages', JSON.stringify(storage));
      languages = storage;

      form.setAttribute('data-loading', '');

      setTimeout(function() {
        form.removeAttribute('data-loading');

        route(basepath + '/');
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
