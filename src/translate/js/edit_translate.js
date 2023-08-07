/*
 * translate/edit_translate.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function edit_translate(uri, search) {
  console.log('edit_translate()');

  const doc = document;
  const body = doc.body;
  doc.title = 'Edit - Translations';
  doc.description.setAttribute('content', 'Edit translation strings of a language');

  const page = doc.getElementById('page');
  const source = doc.querySelector('.edit-translate');
  const clone = source.cloneNode(true);
  clone.removeAttribute('class');
  clone.setAttribute('id', 'edit-translate');
  clone._cloned = true;
  page.insertBefore(clone, source);

  const view = doc.getElementById('edit-translate');
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
    '1': 'Maybe wrong', // type I
    '2': 'Maybe wrong', // type II
    '3': 'Maybe wrong',
    '6': 'System string | Maybe wrong',
    '8': 'Conventional | Maybe wrong'
  };

  const table = view.querySelector('table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  let disambigua = {};

  const lang = search['lang'];
  let lang_code;
  let lang_type;
  let lang_dir;
  let lang_user;

  const ts_src = 'src';
  const tr_src = lang + '-tr';
  const tr_key = 'tr-' + lang;

  if (languages && languages[lang]) {
    lang_code = languages[lang]['code'].toString();
    lang_type = languages[lang]['type'].toString();
    lang_dir = languages[lang]['dir'].toString();
    lang_user = languages[lang]['guid'] ? false : true;

    heading.innerText = 'Edit ' + languages[lang]['name'];
    heading.className = '';
    table.setAttribute('data-lang', lang_code);
    table.setAttribute('data-type', lang_type);
    table.setAttribute('data-dir', lang_dir);
  }

  let storage = localStorage.getItem(tr_key);

  try {
    if (storage) {
      storage = JSON.parse(storage);
    } else {
      storage = {};
    }
  } catch (err) {
    storage = {};
    console.error(err);
  }

  const request = source_request(ts_src);

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

      scrollTo(0, offset);
      tr.classList.add('highlight');
      setTimeout(function() {
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
        setTimeout(function() {
          el.blur();
        }, 100);
      }
    } else {
      doc.querySelectorAll('.toggler').forEach(function(el) {
        if (! el.nextElementSibling.hasAttribute('hidden')) {
          el.nextElementSibling.setAttribute('hidden', '');
          el.classList.remove('opened');
          setTimeout(function() {
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

      try {
        const guid = tr.dataset.guid;
        if (el.srcText != '' && el.srcText === el.textContent) {
          delete storage[guid];
        } else {
          storage[guid] = el.textContent;
        }
        localStorage.setItem(tr_key, JSON.stringify(storage));
      } catch (err) {
        console.error('textInput', err);
      }
    }
  }

  const _textInput = debounce(textInput, false, 50);

  function allowSubmit(evt) {
    console.log('allowSubmit');

    if (doc.getElementById('ctrbar-submit-form').hasAttribute('hidden') && Object.keys(storage).length > 1) {
      doc.getElementById('ctrbar-submit-form').removeAttribute('hidden');
      doc.querySelector('.submit-form').classList.remove('placeholder');
    } else {
      try {
        let storage;
        for (const lang in languages) {
          const tr_key = 'tr-' + lang;
          if (storage = localStorage.getItem(tr_key)) {
            storage = JSON.parse(storage);
            if (Object.keys(storage).length > 1) {
              message('edit-prev');
              break;
            }
          }
        }
      } catch (err) {
        console.error('allowSubmit', err);
      }
    }
  }

  const _allowSubmit = debounce(allowSubmit, true);

  function scrollBody(evt) {
    if (window.pageYOffset > 300) {
      body.classList.add('ndm');
    } else {
      body.classList.remove('ndm');
    }
  }

  const _scrollBody = debounce(scrollBody, false);

  function render_row(td, field, obj) {
    if (field == 'msg_tr') {
      if (td._element) {
        if (obj) {
          const guid = td._parent.dataset.guid;
          const input = td._element;
          if (storage[guid]) {
            input.srcText = obj.toString();
            input.innerText = storage[guid];
            input.dataset.changed = '';
          } else {
            input.innerText = input.srcText = obj.toString();
          }
        }
      } else {
        const input = doc.createElement('span');
        input.className = 'input inline-edit';
        input.contentEditable = 'plaintext-only';
        input.dir = lang_dir;
        td.append(input);
        td._element = input;
      }
    } else if (field == 'disambigua') {
      if (! td._element && obj) {
        const toggler = doc.createElement('button');
        toggler.className = 'toggler';
        toggler.type = 'button';
        toggler.innerText = Object.keys(obj).length;
        const list = doc.createElement('ul');
        const dropdown = doc.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.setAttribute('hidden', '');
        dropdown.append(list);

        td.append(toggler);
        td.append(dropdown);
        td._element = toggler;

        for (const guid of obj) {
          const i = disambigua[guid];
          const item = doc.createElement('li');
          const anchor = doc.createElement('a');
          anchor.href = 'javascript:';
          anchor.innerText = i.toString();
          anchor.setAttribute('data-scroll-row', i);
          item.append(anchor);
          list.append(item);
        }
      }
    } else if (field == 'status') {
      if (td._element) {
        const status = td._element;
        let text;
        if (obj) {
          if (obj == 0) {
            text = 'unfinished';
          } else if (obj == 1) {
            text = 'completed';
          } else if (obj == 2) {
            text = 'vanished';
          }
        } else {
          text = 'unfinished';
        }
        status.className += ' status-' + text;
        status.innerText = text;
      } else {
        const status = doc.createElement('span');
        status.className = 'status';
        td.append(status);
        td._element = status;
      }
    } else if (field == 'msg_extra') {
      if (obj) {
        let text = obj.toString();
        text = text.replace(' | ', '\n');
        td.innerText = text.toString();
      }
    } else if (field == 'notes') {
      if (obj && (lang_user && obj == '0' || ! lang_user)) {
        if (obj in notes) {
          td.innerText = notes[obj].replace(' | ', '\n');
        } else {
          td.innerText = obj.toString();
        }
      }
    } else if (obj) {
      td.innerText = obj.toString();
    }
  }

  function render_table(data) {
    const tr_loading = tbody.firstElementChild;
    const tr_tpl = tbody.querySelector('tr.placeholder');

    if (! thead.hasAttribute('data-rendered')) {
      for (const field in fields) {
        const th = doc.createElement('th');
        th.innerText = fields[field] ?? field;
        thead.firstElementChild.insertBefore(th, thead.firstElementChild.lastElementChild);
      }
      thead.setAttribute('data-rendered', '');
    }

    for (const idx in data) {
      const guid = data[idx]['guid'].toString();
      // completed + revised

      const el_tr = tbody.querySelector('[data-guid="' + guid + '"]');
      const tr = el_tr ?? doc.createElement('tr');

      for (const field in fields) {
        if (field in fields) {
          const obj = data[idx][field];

          const i = Object.keys(fields).indexOf(field);
          const el_td = tr.children.item(i);

          const td = el_td ?? doc.createElement('td');

          if (! td.hasAttribute('data-rendered')) {
            td._parent = tr;
            render_row(td, field, obj);
            td.setAttribute('data-rendered', '');
          } else if (field == 'msg_tr' && storage[guid]) {
            render_row(td, field, storage[guid]);
          } else if (field in data[idx] || lang_user) {
            render_row(td, field, obj);
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
        tr.title = parseInt(idx);

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

  function loader(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      disambiguation(obj);
      render_table(obj);
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);
  }

  function load() {
    doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    table.setAttribute('data-loading', '');
    request.then(function(xhr) {
      loader(xhr);

      if (! lang_user) {
        const request = source_request(tr_src);
        request.then(loader).catch(error);
      } else {
        loader(xhr);
      }

      scrollBody();
      allowSubmit();
    }).catch(error);

    tbody.addEventListener('click', toggler);
    tbody.addEventListener('click', scrollToRow);
    tbody.addEventListener('input', _textInput);
    tbody.addEventListener('input', _allowSubmit);
    window.addEventListener('scroll', _scrollBody);
  }

  function unload() {
    body.classList.remove('dnm');
    tbody.removeEventListener('click', toggler);
    tbody.removeEventListener('click', scrollToRow);
    tbody.removeEventListener('input', _textInput);
    tbody.removeEventListener('input', _allowSubmit);
    window.removeEventListener('scroll', _scrollBody);
    page.removeEventListener('unload', unload);
  }

  load();
  page.addEventListener('unload', unload);
  view.removeAttribute('hidden');
}
