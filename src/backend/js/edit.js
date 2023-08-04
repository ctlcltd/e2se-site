/*
 * backend/edit.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function edit(uri, path, search) {
  const doc = document;
  const source = doc.querySelector('.view-edit');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-edit');
  clone._cloned = true;
  doc.body.insertBefore(clone, source);

  const view = doc.getElementById('view-edit');
  const menu = view.querySelector('.nav.placeholder');
  const heading = view.querySelector('h2');

  nav(menu);

  heading.innerText = uri + ' edit';
  heading.className = '';

  // 
  // { key: value } > 'key=value'
  const body = search;
  const request = api_request('get', uri, body);

  const form = view.querySelector('form');
  const fieldset_ph = form.firstElementChild;

  function render_form(data) {
    const fieldset = doc.createElement('fieldset');

    for (const field in data) {
      const obj = data[field];

      const div = doc.createElement('div');
      const label = doc.createElement('label');
      const input = doc.createElement('input');

      label.innerText = field;        
      input.setAttribute('type', 'text');
      input.value = obj ? obj.toString() : '';

      div.append(label);
      div.append(input);

      fieldset.append(div);

      form.insertBefore(fieldset, fieldset_ph);
    }

    form.classList.remove('placeholder');
  }

  function loader(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error(xhr);
      }

      if (obj.data) {
        render_form(obj.data);
      }
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);
  }

  request.then(loader).catch(error);

  view.removeAttribute('hidden');
}
