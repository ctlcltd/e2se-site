/*
 * translate/add_language.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function add_language(uri, key, value) {
  console.log('add_language()');

  document.title = 'Add language - E2SE Translations';
  document.querySelector('meta[name="description"]').setAttribute('content', 'Add a new language to translations');

  const source = document.querySelector('.view-edit');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'add-language');
  clone.cloned = true;
  document.getElementById('page').insertBefore(clone, source);

  const view = document.getElementById('add-language');
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
    'lang_code': null,
    'lang_locale': null,
    'lang_dir': {'type': 'select', 'options': {'ltr': 'LTR (Left To Right)', 'rtl': 'RTL (Right To Left)'}},
    'lang_name': null,
    'lang_tr_name': null,
    'lang_numerus': {'type': 'number'}
  };

  heading.innerText = 'Add new language';
  heading.className = '';

  const form = view.querySelector('form');
  const fieldset_ph = form.firstElementChild;

  function render_form(data) {
    const fieldset = document.createElement('fieldset');

    for (const field in data) {
      const row = data[field];

      const div = document.createElement('div');
      const label = document.createElement('label');
      let el;

      label.innerText = fields[field] ?? field;

      if (row) {
        if (typeof row == 'object') {
          if (row.type == 'select') {
            el = document.createElement('select');

            for (const option in row.options) {
              const subel = document.createElement('option');
              subel.value = option;
              subel.innerText = row.options[option];
              el.append(subel);
            }
          } else if (row.type == 'textarea') {
            el = document.createElement('textarea');
          } else {
            el = document.createElement('input');
            el.type = row.type;
          }
        }
      } else {
        el = document.createElement('input');
        el.setAttribute('type', 'text');
      }
      
      div.append(label);
      div.append(el);

      fieldset.append(div);

      form.insertBefore(fieldset, fieldset_ph);
    }

    form.classList.remove('placeholder');
  }

  function styles() {
    document.getElementById('ctrbar-add-language').setAttribute('hidden', '');
    document.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    document.querySelector('.submit-form').classList.add('placeholder');
  }

  styles();
  render_form(data);

  view.removeAttribute('hidden');
}
