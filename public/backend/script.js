/*!
 * backend/script.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */
(function() {


const basepath = '/backend';
const apipath = '/api';
const sourcespath = '/sources';
const routes = {
  '' : { '': main },
  'service': { '': service },
  'inspect': { '': list, 'add': edit, 'edit': edit },
  'test': { '': api_test },
  'login': { '': signin },
  'logout': { '': signout }
};


function main() {
  const view = document.getElementById('main');
  const menu = view.querySelector('.nav');

  nav(menu);

  view.removeAttribute('hidden');
}


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


function edit(uri, key, value) {
  const doc = document;
  const source = doc.querySelector('.view-edit');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-edit');
  clone.cloned = true;
  doc.body.insertBefore(clone, source);

  const view = doc.getElementById('view-edit');
  const menu = view.querySelector('.nav.placeholder');
  const heading = view.querySelector('h2');

  nav(menu);

  heading.innerText = uri + ' edit';
  heading.className = '';

  const endpoint = uri;
  const body = value;
  const request = api_request(method, endpoint, body);

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


function service(uri, key, value) {
  const doc = document;
  const source = doc.querySelector('.view-service');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-list');
  clone.cloned = true;
  doc.body.insertBefore(clone, source);

  const view = doc.getElementById('view-list');
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


function signin() {
  const doc = document;
  const view = doc.getElementById('signin');
  const form = doc.getElementById('sign_login');
  const placeholder = form.querySelector('.placeholder').cloneNode();
  const attempts_limit = 3;
  let attempts = 0;
  let msg = null;

  function submit(evt) {
    evt.preventDefault();

    form.setAttribute('disabled', '');
    form.setAttribute('data-loading', '');

    if (msg) {
      msg.replaceWith(placeholder);
    }

    let obj = [];

    for (const el of this.elements) {
      if (el.tagName != 'FIELDSET' && el.tagName != 'BUTTON' && ! (el.type && el.type === 'button')) {
        obj.push(el.name + '=' + el.value);
      }
    }

    if (obj.length) {
      obj = obj.join('&');
    } else {
      form.removeAttribute('disabled');
      form.removeAttribute('data-loading');
      form.reset();

      return message('Please enter your credentials.');
    }

    const request = api_request('post', 'login', '', obj);

    request.then(loader).catch(error);
  }

  function message(text) {
    msg = doc.createElement('div');
    msg.className = 'error';
    msg.innerText = text;

    form.querySelector('.placeholder').replaceWith(msg);
  }

  function loader(xhr) {
    form.reset();

    try {
      const obj = JSON.parse(xhr.response);

      if (obj.status && obj.data) {
        form.removeAttribute('disabled');
        form.removeAttribute('data-loading');

        view.setAttribute('hidden', '');

        sessionStorage.setItem('backend', new Date().toJSON());

        return route(basepath + '/');
      } else {
        if (attempts++ < attempts_limit) {
          form.removeAttribute('disabled');
        }

        message('Wrong credentials.');
      }
    } catch (err) {
      form.removeAttribute('data-loading');
      form.reset();
      
      message('An error occurred.');

      console.error('loader', err);
    }
  }

  function error(xhr) {
    form.reset();
    console.warn(xhr);
  }

  sessionStorage.clear();

  form.addEventListener('submit', submit);

  view.removeAttribute('hidden');
}


function signout() {
  sessionStorage.clear();

  return route(basepath + '/?login');
}


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


function api_test() {
  const doc = document;
  const view = doc.getElementById('api-test');
  const menu = view.querySelector('.nav');
  const request_form = doc.getElementById('api_request');
  const response_form = doc.getElementById('api_response');

  const methods = ['get', 'post'];
  const request = api_request('get');

  const endpoint_select = request_form.querySelector('[name="endpoint"]');
  const method_select = request_form.querySelector('[name="method"]');
  const route_select = request_form.querySelector('[name="route"]');
  const body_input = request_form.querySelector('[name="body"]');
  const response_status = response_form.querySelector('[name="response-status"]');
  const response_body = response_form.querySelector('[name="response-body"]');
  const response_headers = response_form.querySelector('[name="response-headers"]');

  nav(menu);

  function endpointChange() {
    try {
      if (! apiroutes) {
        return false;
      }

      const endpoint = endpoint_select.value;

      route_select.innerHTML = '';

      for (const route in apiroutes[endpoint]) {
        const sub = doc.createElement('option');
        sub.value = route;
        sub.innerText = route;
        route_select.appendChild(sub);
      }
    } catch (err) {
      console.error('endpointChange', err);
    }
  }

  function requestSubmit(evt) {
    evt.preventDefault();

    const method = method_select.value;
    const endpoint = endpoint_select.value;
    const route = route_select.value;
    const body = body_input.value;

    const request = api_request(method, endpoint, route, body);

    response_form.setAttribute('data-loading', '');

    request.then(response).catch(response);
  }

  function requestReset(evt) {
    evt && evt.preventDefault();

    body_input.value = '';
    route_select.value = '';
    endpoint_select.value = endpoint_select.options[0].value;

    endpointChange();

    method_select.value = method_select.options[0].value;
    route_select.value = route_select.options[0].value;
  }

  function response(xhr) {
    response_form.removeAttribute('data-loading');

    response_status.value = xhr.status;
    response_body.value = xhr.response;
    response_headers.value = xhr.getAllResponseHeaders();
  }

  function resume() {
    if (! apiroutes) {
      return false;
    }

    view.removeAttribute('hidden');

    requestReset();
  }

  function loader(xhr) {
    try {
      view.removeAttribute('hidden');

      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error(xhr);
      }

      apiroutes = obj.data;

      for (const method of methods) {
        const sub = doc.createElement('option');
        sub.value = method;
        sub.innerText = method.toUpperCase();
        method_select.appendChild(sub);
      }
      for (const endpoint in obj.data) {
        const sub = doc.createElement('option');
        sub.value = endpoint;
        sub.innerText = endpoint;
        endpoint_select.appendChild(sub);
      }

      view.setAttribute('data-render', '');

      endpointChange();
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);
  }

  request_form.addEventListener('submit', requestSubmit);
  request_form.addEventListener('reset', requestReset);
  endpoint_select.addEventListener('change', endpointChange);

  if (view.hasAttribute('data-render')) {
    resume();
  } else {
    request.then(loader).catch(error);
  }
}


function nav(menu) {
  const nav = document.getElementById('nav').cloneNode(true);
  const nav_items = nav.querySelectorAll('a');

  function click(evt) {
    evt.preventDefault();

    route(this.href);

    return false;
  }

  for (const el of nav_items) {
    el.href = basepath + '/' + el.getAttribute('href');
    el.onclick = click;
  }

  nav.removeAttribute('id');
  nav.removeAttribute('hidden');

  navigation = nav;

  if (menu) {
    const nav = navigation.cloneNode(true);

    menu.replaceWith(navigation);
  }

  return navigation;
}


function route(href, title) {
  const views = document.querySelectorAll('main');
  const history = href ? true : false;

  href = href ? href : window.location.href;
  title = title ? title : document.title;

  if (href.indexOf(basepath) === -1) {
    throw 'Wrong base path';
  }

  const url = href.replace(window.location.protocol + '//' + window.location.host, '');
  const path = url.split('?');
  const uri = path[1] && /&/.test(path[1]) == false ? path[1].split('&')[0] : '';
  const qs = path[1] ? path[1].split('&') : '';
  const key = qs[1] && qs[1] != uri ? qs[1] : '';
  const value = qs[2] && qs[1] != uri ? qs[2] : '';

  console.info('route()', { path, uri, qs, key, value });

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
    throw 'Callable Function';
  }

  if (history) {
    window.history.pushState('', title, url);
  }

  routes[uri][key].call(this, uri, key, value);
}


var apiroutes;
var navigation;

function init() {
  try {
    sessionStorage.setItem('_test', '1');
    if (! sessionStorage.getItem('_test')) {
      throw 'Storage Error';
    }
    sessionStorage.removeItem('_test');
  } catch (err) {
    console.error(err);
  }

  function popState(evt) {
    route();
  }

  if (sessionStorage.getItem('backend')) {
    nav();
    route();
  } else {
    signin();
  }

  window.addEventListener('popstate', popState);
}

init();

})();