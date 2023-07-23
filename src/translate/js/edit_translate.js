/*
 * translate/edit_translate.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function edit_translate(uri, key, value) {
  console.log('edit_translate()');

  document.title = 'Edit - E2SE Translations';
  document.querySelector('meta[name="description"]').setAttribute('content', 'Edit translation strings of a language');

  const source = document.querySelector('.view-list');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'edit-translate');
  clone.cloned = true;
  document.getElementById('page').insertBefore(clone, source);

  const view = document.getElementById('edit-translate');
  const heading = view.querySelector('h2');

  const fields = {
    'ctx_name': 'Node',
    'msg_src': 'Source',
    'msg_tr': 'Translation',
    'disambigua': 'Disambigua',
    'notes': 'Notes',
    'msg_extra': 'Comment',
    'msg_comment': 'Context',
    'status': 'Status'
  };
  const notes = {
    '0': 'No translate',
    '1': 'Maybe wrong', // type: 1
    '2': 'Maybe wrong', // type: 2
    '3': 'Maybe wrong',
    '6': 'System string | Maybe wrong',
    '8': 'Conventional | Maybe wrong'
  };

  const lang = value.split('=')[1];
  let lang_dir;

  const ts_src = 'src';
  const tr_src = lang + '-tr';
  const tr_key = 'tr-' + lang;

  if (languages && languages[lang]) {
    lang_dir = languages[lang]['dir'];

    heading.innerText = 'Edit ' + languages[lang]['name'];
    heading.className = '';
  }

  let storage = window.localStorage.getItem(tr_key);

  try {
    if (storage) {
      storage = JSON.parse(storage);
    } else {
      storage = {};
    }
  } catch (err) {
    storage = {};

    error(null, err);
  }

  const request = source_request(ts_src);
  const subrequest = source_request(tr_src);

  let disambigua = {};

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  function disambiguation(data) {
      if (Object.keys(disambigua).length == 0) {
        for (const idx in data) {
          const guid = data[idx]['guid'];
          disambigua[guid] = idx;
        }
      }
  }

  function scrollToRow(evt) {
    const el = evt.target;

    if (el.hasAttribute('data-scroll-row')) {
      const idx = el.getAttribute('data-scroll-row');
      const i = parseInt(idx) - 1;
      const tr = tbody.rows.item(i);
      const offset = tr.previousElementSibling ? tr.previousElementSibling.offsetTop : tr.offsetTop;

      window.scrollTo(0, offset);
      tr.classList.add('highlight');
      window.setTimeout(function() {
        tr.classList.remove('highlight');
      }, 2e3);
    }
  }

  function toggler(evt) {
    const el = evt.target;

    if (el.classList.contains('toggler')) {
      if (el.nextElementSibling.hasAttribute('hidden')) {
        el.nextElementSibling.removeAttribute('hidden');
        el.classList.add('opened');
      } else {
        el.nextElementSibling.setAttribute('hidden', '');
        el.classList.remove('opened');
        window.setTimeout(function() {
          el.blur();
        }, 100);
      }
    } else {
      document.querySelectorAll('.toggler').forEach(function(el) {
        if (! el.nextElementSibling.hasAttribute('hidden')) {
          el.nextElementSibling.setAttribute('hidden', '');
          el.classList.remove('opened');
          window.setTimeout(function() {
            el.blur();
          }, 100);
        }
      });
    }
  }

  function textInput(evt) {
    const el = evt.target;

    if (el.classList.contains('input')) {
      const tr = el.parentElement.closest('[data-guid]');
      // console.log(evt);

      try {
        const guid = tr.dataset.guid;
        if (el.srcText != '' && el.srcText === el.textContent) {
          delete storage[guid];
        } else {
          storage[guid] = el.textContent;
        }
        // console.log(storage);
        window.localStorage.setItem(tr_key, JSON.stringify(storage));
      } catch (err) {
        error(null, err);
      }
    }
  }

  function render_row(td, field, text) {
    if (field == 'msg_tr') {
      if (td.querySelector('span')) {
        const parent = td.closest('[data-guid]');
        const guid = parent.dataset.guid;
        const input = td.querySelector('span');
        if (storage[guid]) {
          input.srcText = text.toString();
          input.innerText = storage[guid];
          input.dataset.changed = '';
        } else {
          input.innerText = input.srcText = text.toString();
        }
      } else {
        const input = document.createElement('span');
        input.className = 'input inline-edit';
        input.contentEditable = 'plaintext-only';
        input.dir = lang_dir;
        // input.innerText = text ? text.toString() : '';
        td.append(input);
      }
    } else if (field == 'disambigua') {
      if (text && typeof text === 'object' && Object.keys(text).length != 0) {
        const toggler = document.createElement('button');
        toggler.className = 'toggler';
        toggler.type = 'button';
        toggler.innerText = Object.keys(text).length;
        const list = document.createElement('ul');
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.setAttribute('hidden', '');
        dropdown.append(list);

        td.append(toggler);
        td.append(dropdown);

        for (const guid of text) {
          const i = disambigua[guid];
          const item = document.createElement('li');
          const anchor = document.createElement('a');
          anchor.href = 'javascript:';
          anchor.innerText = i.toString();
          anchor.setAttribute('data-scroll-row', i);
          item.append(anchor);
          list.append(item);
        }
      }
    } else if (field == 'status') {
      if (td.querySelector('span')) {
        const status = td.querySelector('span');
        if (text !== '') {
          let val;
          if (text == 0) {
            val = 'unfinished';
          } else if (text == 1) {
            val = 'completed';
          } else if (text == 2) {
            val = 'vanished';
          }
          status.className += ' status-' + val;
          status.innerText = val;
        }
      } else {
        const status = document.createElement('span');
        status.className = 'status';
        td.append(status);
      }
    } else if (field == 'msg_extra') {
      if (text) {
        let val = text.toString();
        val = val.replace(' | ', '\n');
        td.innerText = val.toString();
      }
    } else if (field == 'notes') {
      if (text) {
        if (text in notes) {
          // const parent = td.closest('[data-guid]');
          // parent.setAttribute('data-notes', text);
          td.innerText = notes[text].replace(' | ', '\n');
        } else {
          td.innerText = text.toString();
        }
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
      // completed + revised

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
        tr.title = idx;

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

  // var i = 0;
  function load(xhr) {
    // console.log('load', i++, xhr);
    try {
      const obj = JSON.parse(xhr.response);

      document.querySelector('.submit-form').classList.remove('placeholder');

      disambiguation(obj);
      render_table(obj);
    } catch (err) {
      // console.error('edit_translate()', 'load()', err);

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

  tbody.addEventListener('click', toggler);
  tbody.addEventListener('click', scrollToRow);
  tbody.addEventListener('input', textInput);
}
