/*
 * translate/add_language.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function add_language(uri, key, value) {
  const source = document.querySelector('.view-edit');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'add-language');
  clone.cloned = true;
  document.body.insertBefore(clone, source);

  const view = document.getElementById('add-language');
  const heading = view.querySelector('h2');

  const fields = {
    'lang_code': 'ISO code (2)',
    'lang_iso': 'ISO code (2_2)',
    'lang_dir': 'Direction',
    'lang_name': 'Name',
    'lang_tr_name': 'Translated name',
    'lang_numerus': 'Numerus'
  };
  const data = {
    'lang_code': null,
    'lang_iso': null,
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

  render_form(data);

  view.removeAttribute('hidden');
}
