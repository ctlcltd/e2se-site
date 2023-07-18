/*
 * translate/edit_translate.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

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
