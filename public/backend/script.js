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
  const source = document.querySelector('.view-list');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-list');
  clone.cloned = true;
  document.body.insertBefore(clone, source);

  const view = document.getElementById('view-list');
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
    evt && evt.preventDefault();

    if (evt.target.parentElement.classList.contains('action-edit') || evt.target.tagName == 'SPAN') {
      route(this.dataset.href);
    }

    return false;
  }

  function actionDelete(evt) {
    evt && evt.preventDefault();

    if (window.confirm('Are you sure to delete this item?')) {
      route(this.href);
    }

    return false;
  }

  function render(data) {
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

        //-TEMP
        if (! get_id && field.indexOf('_id') != -1) {
          get_id = '&' + field + '=' + row.toString();
        }

        if (i === 0) {
          const th = document.createElement('th');
          th.innerText = field;
          thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
        }
        //-TEMP

        const td = document.createElement('td');
        td.innerText = row ? row.toString() : '';
        tr.insertBefore(td, tr_ph);
      }

      //-TEMP
      action_edit.href += get_id;
      action_delete.href += get_id;
      //-TEMP

      action_delete.onclick = actionDelete;

      tr.setAttribute('data-href', action_edit.href);
      tr.onclick = actionEdit;

      tbody.prepend(tr);

      i++;
    }

    tr_tpl.remove();
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
      console.error('list()', 'load()', err);

      error(null, err);
    }
  }

  function error(xhr, err) {
    console.error('list()', 'error()', xhr || '', err || '');
  }

  request.then(load).catch(error);

  view.removeAttribute('hidden');
}


function edit(uri, key, value) {
  const source = document.querySelector('.view-edit');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'view-edit');
  clone.cloned = true;
  document.body.insertBefore(clone, source);

  const view = document.getElementById('view-edit');
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

  function render(data) {
    const fieldset = document.createElement('fieldset');

    for (const field in data) {
      const row = data[field];

      const div = document.createElement('div');
      const label = document.createElement('label');
      const input = document.createElement('input');

      label.innerText = field;        
      input.setAttribute('type', 'text');
      input.value = row ? row.toString() : '';

      div.append(label);
      div.append(input);

      fieldset.append(div);

      form.insertBefore(fieldset, fieldset_ph);
    }

    form.classList.remove('placeholder');
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
      console.error('edit()', 'load()', err);

      error(false, err);
    }
  }

  function error(xhr, err) {
    console.error('edit()', 'error()', xhr || '', err || '');
  }

  request.then(load).catch(error);

  view.removeAttribute('hidden');
}


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


function signin() {
  const view = document.getElementById('signin');
  const form = document.getElementById('sign_login');
  const placeholder = form.querySelector('.placeholder').cloneNode();
  const attempts_limit = 3;
  let attempts = 0, err_log = null;

  function submit(evt) {
    evt && evt.preventDefault();

    form.setAttribute('disabled', '');
    form.setAttribute('data-loading', '');

    err_log && err_log.replaceWith(placeholder);

    let body = [];

    for (const el of this.elements) {
      if (el.tagName != 'FIELDSET' && el.tagName != 'BUTTON' && ! (el.type && el.type === 'button')) {
        body.push(el.name + '=' + el.value);
      }
    }

    if (body.length) {
      body = body.join('&');
    } else {
      form.removeAttribute('disabled');
      form.removeAttribute('data-loading');

      return error(null, 'Please enter your credentials.');
    }

    const login = api_request('post', '', body);

    login.then(next).catch(error);
  }

  function next(xhr) {
    form.reset();

    try {
      const obj = JSON.parse(xhr.response);

      if (obj.status && obj.data) {
        form.removeAttribute('disabled');
        form.removeAttribute('data-loading');

        view.setAttribute('hidden', '');

        var session_value = '1; ';
        var session_path = 'path=' + basepath + '; ';
        var session_secured = ''; //'secure; ';
        var session_expires = 'expires=' + new Date(new Date().getTime() + (60 * 60 * 24 * 1e3)).toGMTString() + '; ';

        console.log('signin()', 'next()', 'backend-sign=' + session_value + session_path + session_expires + session_secured + 'samesite=strict');

        document.cookie = 'backend-sign=' + session_value + session_path + session_expires + session_secured + 'samesite=strict';

        return route(basepath + '/');
      } else {
        if (attempts++ < attempts_limit) {
          form.removeAttribute('disabled');
        }

        throw 'Wrong credentials.';
      }
    } catch (err) {
      form.removeAttribute('data-loading');

      error(xhr, err);
    }
  }

  function error(xhr, msg) {
    form.reset();

    if (xhr && ! msg && xhr.status) {
      msg = 'An error occurred.';
    }

    err_log = document.createElement('div');
    err_log.className = 'error';
    err_log.innerText = msg;

    form.querySelector('.placeholder').replaceWith(err_log);

    console.error('signin()', 'error()', msg);
  }

  document.cookie = 'backend-sign=; expires=' + new Date(0).toGMTString() + ', samesite=strict';

  form.addEventListener('submit', submit);

  view.removeAttribute('hidden');
}


function signout() {
  return route(basepath + '/?login');
}


function api_request(method, endpoint, body) {
  const xhr = new XMLHttpRequest();
  let url = apipath + '/' + (endpoint ? '?body=' + endpoint : '');

  if (body && method === 'get') {
    url += '&' + body;
    body = null;
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
  const view = document.getElementById('api-test');
  const menu = view.querySelector('.nav');
  const request_form = document.getElementById('api_request');
  const response_form = document.getElementById('api_response');
  const methods = ['get', 'post'];
  const request = api_request('get', '', '');
  const endpoint_select = request_form.querySelector('[name="endpoint"]');
  const method_select = request_form.querySelector('[name="method"]');
  const route_select = request_form.querySelector('[name="route"]');
  const body_input = request_form.querySelector('[name="body"]');
  const response_status = response_form.querySelector('[name="response-status"]');
  const response_body = response_form.querySelector('[name="response-body"]');
  const response_headers = response_form.querySelector('[name="response-headers"]');

  nav(menu);

  function response(xhr) {
    console.log('api_test()', 'response()', xhr);

    response_form.removeAttribute('data-loading');

    response_status.value = xhr.status;
    response_body.value = xhr.response;
    response_headers.value = xhr.getAllResponseHeaders();
  }

  function load(xhr) {
    console.log('api_test()', 'load()', xhr);

    try {
      view.removeAttribute('hidden');

      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error();
      }

      apiroutes = obj.data;

      for (const method of methods) {
        let option;
        option = document.createElement('option'), option.value = method, option.innerText = method.toUpperCase();
        method_select.appendChild(option);
      }
      for (const endpoint in obj.data) {
        let option;
        option = document.createElement('option'), option.value = endpoint, option.innerText = endpoint;
        endpoint_select.appendChild(option);
      }

      view.setAttribute('data-render', true);

      endpointChange();
    } catch (err) {
      console.error('api_test()', 'load()', err);
    }
  }

  function error() {
    view.setAttribute('hidden', '');

    return route(basepath + '/?login');
  }

  function resume() {
    console.log('api_test()', 'resume()');

    if (! apiroutes) throw 0;

    view.removeAttribute('hidden');

    requestReset();
  }

  function requestSubmit(evt) {
    evt && evt.preventDefault();

    const method = method_select.value;
    const endpoint = endpoint_select.value;
    const body = body_input.value;

    const request = api_request(method, endpoint, body);

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

  function endpointChange() {
    try {
      if (! apiroutes) throw 0;

      const endpoint = endpoint_select.value;

      route_select.innerHTML = '';

      for (const route in apiroutes[endpoint]) {
        let option;
        option = document.createElement('option'), option.value = route, option.innerText = route;
        route_select.appendChild(option);
      }
    } catch (err) {
      console.error('api_test()', 'endpointChange()', err);
    }
  }

  request_form.addEventListener('submit', requestSubmit);
  request_form.addEventListener('reset', requestReset);
  endpoint_select.addEventListener('change', endpointChange);

  if (view.hasAttribute('data-render')) {
    resume();
  } else {
    request.then(load).catch(error);
  }
}


function nav(menu) {
  const nav = document.getElementById('nav').cloneNode(true);
  const nav_items = nav.querySelectorAll('a');

  function click(evt) {
    evt && evt.preventDefault();

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


let apiroutes;
let navigation;

function init() {
  var tc_value = '1; ';
  var tc_path = 'path=' + basepath + '; ';
  var tc_secured = ''; //'secure; ';
  var tc_expires = 'expires=' + new Date(new Date().getTime() + (60 * 1e3)).toGMTString() + '; ';

  document.cookie = 'backend-test=' + tc_value + tc_path + tc_expires + tc_secured + 'samesite=strict';

  if (document.cookie.indexOf('backend-test') == -1) {
    return;
  }

  function popState(evt) {
    route();
  }

  if (document.cookie.indexOf('backend-sign') != -1) {
    nav();
    route();
  } else {
    signin();
  }

  window.addEventListener('popstate', popState);
}

init();

})();