/*
 * backend/list.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function list(uri, key, value) {
  const doc = document;
  const source = doc.querySelector('.view-list');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-list');
  clone.cloned = true;
  doc.body.insertBefore(clone, source);

  const view = doc.getElementById('view-list');
  const menu = view.querySelector('.nav.placeholder');
  const heading = view.querySelector('h2');

  nav(menu);

  heading.innerText = uri + ' list';
  heading.className = '';

  const endpoint = uri;
  const method = 'get';
  const request = api_request(method, endpoint);

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  function actionEdit(evt) {
    evt.preventDefault();

    if (evt.target.parentElement.classList.contains('action-edit') || evt.target.tagName == 'SPAN') {
      route(this.dataset.href);
    }

    return false;
  }

  function actionDelete(evt) {
    evt.preventDefault();

    if (window.confirm('Are you sure to delete this item?')) {
      route(this.href);
    }

    return false;
  }

  function render_table(data) {
    var i = 0;

    let get_id;
    const tr_tpl = tbody.firstElementChild;

    for (const idx in data) {
      const tr = tr_tpl.cloneNode(true);
      const tr_ph = tr.firstElementChild;
      const action_edit = tr.querySelector('span.action-edit > a');
      const action_delete = tr.querySelector('span.action-delete > a');

      for (const field in data[idx]) {
        const row = data[idx][field];

        if (! get_id && field.indexOf('_id') != -1) {
          get_id = '&' + field + '=' + row.toString();
        }

        if (i === 0) {
          const th = doc.createElement('th');
          th.innerText = field;
          thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
        }

        const td = doc.createElement('td');
        td.innerText = row ? row.toString() : '';
        tr.insertBefore(td, tr_ph);
      }

      action_edit.href += get_id;
      action_delete.href += get_id;
      action_delete.onclick = actionDelete;

      tr.setAttribute('data-href', action_edit.href);
      tr.onclick = actionEdit;

      tbody.prepend(tr);

      i++;
    }

    tr_tpl.remove();
    table.classList.remove('placeholder');
  }

  function loader(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error(xhr);
      }

      if (obj.data) {
        render_table(obj.data);
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
