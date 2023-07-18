/*!
 * translate/script.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */
(function() {


const basepath = '/translate';
const apipath = '/api';
const sourcespath = '/sources';
const routes = {
  '' : { '': main },
  'edit.html': { '': edit_translate },
  'add-language.html': { '': add_language }
};


function main() {
  const view = document.getElementById('main');

  const fields = {
    'iso': 'Language',
    'name': 'Name',
    'tr_name': 'Translated name',
    'completed': 'Completed',
    'revised': 'Revised'
  };

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  function actionEdit(evt) {
    evt && evt.preventDefault();

    route(this.dataset.href);

    return false;
  }

  function render_row(td, field, text) {
    td.innerText = text ? text.toString() : '';

    //
    if (text && field == 'completed') {
      td.style = 'color: gray;';
      td.innerHTML = td.innerText + '% <abbr style="border-bottom: 1px dotted">?</abbr>';
    } else if (text && field == 'revised') {
      td.innerText = text ? 'yes' : 'none';
    }
  }

  function render_table(data) {
    const tr_loading = tbody.firstElementChild;
    const tr_tpl = tbody.querySelector('tr.placeholder');

    if (! thead.hasAttribute('data-rendered')) {
      for (const field in fields) {
        const th = document.createElement('th');
        th.innerText = fields[field] ?? field;
        thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
      }
      thead.setAttribute('data-rendered', '');
    }

    for (const idx in data) {
      const guid = data[idx]['guid'].toString();
      const code = data[idx]['code'].toString();
      const lang_dir = data[idx]['dir'].toString();

      const el_tr = tbody.querySelector('[data-guid="' + guid + '"]');
      const tr = el_tr ? el_tr : document.createElement('tr');

      for (const field in fields) {
        if (field in fields) {
          const text = data[idx][field];

          const i = Object.keys(fields).indexOf(field);
          const el_td = tr.children.item(i);

          const td = el_td ?? document.createElement('td');

          if (! td.hasAttribute('data-rendered')) {
            render_row(td, field, text);
            td.setAttribute('data-rendered', '');
          } else if (field in data[idx]) {
            render_row(td, field, text);
          }

          if (! el_td) {
            tr.append(td);
          }
        }
      }

      if (! el_tr) {
        if (tr_tpl) {
          for (const td of tr_tpl.children) {
            tr.append(td.cloneNode(true));
          }
        }

        const action_edit = tr.querySelector('span.action-edit > a');
        action_edit.href += '?lang=' + code;
        tr.setAttribute('data-guid', guid);
        tr.setAttribute('data-href', action_edit.href);
        tr.onclick = actionEdit;

        tbody.append(tr);
      }
    }

    if (tr_tpl) {
      tr_tpl.remove();
    }
    tr_loading.remove();
    table.removeAttribute('data-loading');
    table.classList.remove('placeholder');
    table.setAttribute('data-rendered', '');
  }

  if (! table.hasAttribute('data-rendered') && languages) {
    table.setAttribute('data-loading', '');
    render_table(languages);
  }

  view.removeAttribute('hidden');
}


function edit_translate(uri, key, value) {
  const source = document.querySelector('.view-list');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'edit-translate');
  clone.cloned = true;
  document.body.insertBefore(clone, source);

  const view = document.getElementById('edit-translate');
  const heading = view.querySelector('h2');

  const fields = {
    'ctx_name': 'Context',
    'msg_src': 'Source',
    'msg_tr': 'Translation',
    'msg_comment': 'Disambigua',
    'msg_extra': 'Comment',
    'status': 'Status',
    'notes': 'Notes',
    'revised': 'Revised'
  };

  const lang = value.split('=')[1];
  let lang_dir;

  const ts_src = 'src';
  const tr_src = lang + '-tr';

  if (languages && languages[lang]) {
    lang_dir = languages[lang]['dir'];

    heading.innerText = 'Edit ' + languages[lang]['name'];
    heading.className = '';
  }

  const request = source_request(ts_src);
  const subrequest = source_request(tr_src);

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  function actionEdit(evt) {
    evt && evt.preventDefault();

    route(this.dataset.href);

    return false;
  }

  function render_row(td, field, text) {
    if (field == 'msg_tr') {
      if (td.querySelector('span')) {
        const input = td.querySelector('span');
        input.innerText = text.toString();
      } else {
        const input = document.createElement('span');
        input.className = 'input inline-edit';
        input.contentEditable = true;
        input.dir = lang_dir;
        td.append(input);
      }
    } else if (text) {
      td.innerText = text.toString();
    }
  }

  function render_table(data) {
    const tr_loading = tbody.firstElementChild;
    const tr_tpl = tbody.querySelector('tr.placeholder');

    if (! thead.hasAttribute('data-rendered')) {
      for (const field in fields) {
        const th = document.createElement('th');
        th.innerText = fields[field] ?? field;
        thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
      }
      thead.setAttribute('data-rendered', '');
    }

    for (const idx in data) {
      const guid = data[idx]['guid'].toString();

      const el_tr = tbody.querySelector('[data-guid="' + guid + '"]');
      const tr = el_tr ?? document.createElement('tr');

      for (const field in fields) {
        if (field in fields) {
          const text = data[idx][field];

          const i = Object.keys(fields).indexOf(field);
          const el_td = tr.children.item(i);

          const td = el_td ?? document.createElement('td');

          if (! td.hasAttribute('data-rendered')) {
            render_row(td, field, text);
            td.setAttribute('data-rendered', '');
          } else if (field in data[idx]) {
            render_row(td, field, text);
          }

          if (! el_td) {
            tr.append(td);
          }
        }
      }

      if (! el_tr) {
        if (tr_tpl) {
          for (const td of tr_tpl.children) {
            tr.append(td.cloneNode(true));
          }
        }

        tr.setAttribute('data-guid', guid);

        tbody.append(tr);
      }
    }

    if (tr_tpl) {
      tr_tpl.remove();
    }
    tr_loading.remove();
    table.removeAttribute('data-loading');
    table.classList.remove('placeholder');
  }

  var i = 0;
  function load(xhr) {
    console.log('load', i++, xhr);
    try {
      const obj = JSON.parse(xhr.response);

      render_table(obj);
    } catch (err) {
      console.error('edit_translate()', 'load()', err);

      error(null, err);
    }
  }

  function error(xhr, err) {
    console.error('edit_translate()', 'error()', xhr || '', err || '');
  }

  table.setAttribute('data-loading', '');
  request.then(function(xhr) {
    load(xhr);
    subrequest.then(load).catch(error);
  }).catch(error);
  view.removeAttribute('hidden');
}


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


function api_request(method, endpoint, body) {
  const xhr = new XMLHttpRequest();
  let url = apipath + endpoint;

  if (url.substr(-1) != '/') {
    url += '/';
  }

  if (body && method === 'get') {
    url += '?' + body;
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


function source_request(name) {
  const xhr = new XMLHttpRequest();
  const filename = 'e2se-ts-' + name + '.json';
  const url = sourcespath + '/' + filename;

  xhr.open('get', url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send();

  return new Promise(function(resolve, reject) {
    xhr.onload = function() { resolve(xhr); };
    xhr.onerror = function() { reject(xhr); };
  });
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
  const uri = path[0].split('/')[2];
  const qs = path[1] ? path[1].split('&') : '';
  const key = '';
  const value = qs[0] ? qs[0] : '';

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


let languages;
let navigation;

function init() {
  const name = 'langs';
  const request = source_request(name);

  function load(xhr) {
    try {
      languages = JSON.parse(xhr.response);

      route();
    } catch (err) {
      console.error('init()', 'load()', err);

      error(null, err);
    }
  }

  function resume() {

  }

  function popState(evt) {
    console.log('popState()', evt);
    route();
  }

  function error(xhr, err) {
    console.error('init()', 'error()', xhr || '', err || '');
  }

  request.then(load).catch(error);
  window.addEventListener('popstate', popState);
}

init();

})();