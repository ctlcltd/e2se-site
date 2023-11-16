/* backend/service.js */

function service(uri, path, search) {
  const doc = document;
  const source = doc.querySelector('.view-service');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-list');
  clone._cloned = true;
  doc.body.insertBefore(clone, source);

  const view = doc.getElementById('view-list');
  const menu = view.querySelector('.nav.placeholder');
  const heading = view.querySelector('h2');

  nav(menu);

  heading.className = '';

  const request = api_request('get', uri);

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  function actionEdit(evt) {
    evt && evt.preventDefault();

    route(this.dataset.href);

    return false;
  }

  function render_table(data) {
    var i = 0;
    let action_href;

    thead.firstElementChild.remove();
    tbody.firstElementChild.remove();

    for (const idx in data) {
      const tr = doc.createElement('tr');

      for (const field in data[idx]) {
        const obj = data[idx][field];

        if (i == 0) {
            const th = doc.createElement('th');
            th.innerText = field;
            thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
        }

        const td = doc.createElement('td');
        td.innerText = obj ? obj.toString() : '';
        tr.insertBefore(td, tr.lastElementChild);

        action_href = '?row=' + obj;
      }

      tr.setAttribute('data-href', action_href);
      tr.onclick = actionEdit;

      tbody.append(tr);
      i++;
    }

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

  function error(xhr, err) {
    console.warn(xhr);
  }

  request.then(loader).catch(error);

  view.removeAttribute('hidden');
}
