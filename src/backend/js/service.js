/*
 * backend/service.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function service(uri, key, value) {
  const source = document.querySelector('.view-service');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-list');
  clone.cloned = true;
  document.body.insertBefore(clone, source);

  const view = document.getElementById('view-list');
  const menu = view.querySelector('.nav.placeholder');
  const heading = view.querySelector('h2');

  nav(menu);

  heading.className = '';

  const endpoint = uri;
  const method = 'get';
  const request = api_request(method, endpoint);

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  function actionEdit(evt) {
    evt && evt.preventDefault();

    route(this.dataset.href);

    return false;
  }

  function render(data) {
    var i = 0;
    let action_href;

    thead.firstElementChild.remove();
    tbody.firstElementChild.remove();

    for (const idx in data) {
      const tr = document.createElement('tr');

      for (const field in data[idx]) {
        const row = data[idx][field];

        if (i == 0) {
            const th = document.createElement('th');
            th.innerText = field;
            thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
        }

        const td = document.createElement('td');
        td.innerText = row ? row.toString() : '';
        tr.insertBefore(td, tr.lastElementChild);

        action_href = '?row=' + row;
      }

      tr.setAttribute('data-href', action_href);
      tr.onclick = actionEdit;

      tbody.append(tr);
      i++;
    }

    table.classList.remove('placeholder');
  }

  function load(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error(obj.data);
      }

      if (obj.data) {
        render(obj.data);
      }
    } catch (err) {
      console.error('service()', 'load()', err);

      error(null, err);
    }
  }

  function error(xhr, err) {
    console.error('service()', 'error()', xhr || '', err || '');
  }

  request.then(load).catch(error);

  view.removeAttribute('hidden');
}
