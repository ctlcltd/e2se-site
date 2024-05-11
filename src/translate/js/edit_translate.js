/* translate/edit_translate.js */

function edit_translate(uri, search) {
  // console.log('edit_translate()');

  const doc = document;
  const body = doc.body;
  doc.title = 'Edit - Translations';
  doc.description.setAttribute('content', 'Edit translation strings of a language');
  urlc(uri, search);

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
    'ctx_name': 'Context',
    'msg_src': 'Source',
    'msg_tr': 'Translation',
    'disambigua': 'Disambiguation',
    'notes': 'Notes',
    'msg_extra': 'Comment',
    'msg_comment': 'Label',
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

  let tdata = {};

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

  function index(data) {
      if (Object.keys(tdata).length == 0) {
        for (const i in data) {
          const guid = data[i]['guid'];
          tdata[guid] = parseInt(i);
        }
      }
  }

  function scrollToRow(evt) {
    const el = evt.target;

    if (el.hasAttribute('data-scroll-row')) {
      const guid = el.getAttribute('data-scroll-row');
      const tr = tbody.querySelector('[data-guid="' + guid + '"]');
      if (tr) {
        const offset = tr.previousElementSibling ? tr.previousElementSibling.offsetTop : tr.offsetTop;

        scrollTo(0, offset);
        tr.classList.add('highlight');
        setTimeout(function() {
          tr.classList.remove('highlight');
        }, 2e3);
      }
    }
  }

  function sortByColumns(evt) {
    const el = evt.target;

    if (el.classList.contains('sort')) {
      const th = el.parentElement;
      let sort = th.getAttribute('data-sort-column');
      let column = -1;
      let order = 0;
      if (sort != '1') {
        column = th.cellIndex;
        order = sort == '' ? 0 : ! parseInt(sort);
        sort = order ? 1 : 0;
      } else {
        sort = '';
      }

      for (const cell of thead.rows[0].cells) {
        cell.setAttribute('data-sort-column', '');
      }

      th.setAttribute('data-sort-column', sort);
      sort_table(column, order);

      try {
        localStorage.setItem('_tristate', JSON.stringify([column, order]));
      } catch (err) {
        console.error('sortByColumns', err);
      }
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

  function check_submit() {
    if (doc.getElementById('ctrbar-submit-form').hasAttribute('hidden') && Object.keys(storage).length != 0) {
      doc.getElementById('ctrbar-submit-form').removeAttribute('hidden');
      doc.querySelector('.submit-form').classList.remove('placeholder');
    } else {
      try {
        let storage;
        for (const lang in languages) {
          const tr_key = 'tr-' + lang;
          if (storage = localStorage.getItem(tr_key)) {
            storage = JSON.parse(storage);
            if (Object.keys(storage).length != 0) {
              message('editprev');
              break;
            }
          }
        }
      } catch (err) {
        console.error('check_submit', err);
      }
    }
  }

  let submitTimer;

  function load_submit_allow() {
    function allow() {
      if (doc.getElementById('ctrbar-submit-form').hasAttribute('hidden') && Object.keys(storage).length != 0) {
        doc.getElementById('ctrbar-submit-form').removeAttribute('hidden');
        doc.querySelector('.submit-form').classList.remove('placeholder');

        window.clearInterval(submitTimer);
      } else if (! doc.getElementById('ctrbar-submit-form').hasAttribute('hidden')) {
        window.clearInterval(submitTimer);
      }
    }

    submitTimer = window.setInterval(allow, 3e3);
  }

  function unload_submit_allow() {
    window.clearInterval(submitTimer);
  }

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
          const i = tdata[guid];
          const item = doc.createElement('li');
          const anchor = doc.createElement('a');
          anchor.href = 'javascript:';
          anchor.innerText = i.toString();
          anchor.setAttribute('data-scroll-row', guid);
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
    if (! table.hasAttribute('data-sortable')) {
      let i = 0;
      for (const field in fields) {
        const th = thead.rows[0].cells.item(i++);
        const button = document.createElement('button');
        button.className = 'sort';
        button.innerText = fields[field] ?? field;
        th.setAttribute('data-sort-column', '');
        th.innerText = '';
        th.append(button);
      }
      table.setAttribute('data-sortable', '');
    }

    for (const i in data) {
      const guid = data[i]['guid'].toString();
      // completed + revised

      const el_tr = tbody.querySelector('[data-guid="' + guid + '"]');
      const tr = el_tr ?? doc.createElement('tr');

      for (const field in fields) {
        if (field in fields) {
          const obj = data[i][field];

          const td_i = Object.keys(fields).indexOf(field);
          const el_td = tr.children.item(td_i);

          const td = el_td ?? doc.createElement('td');

          if (! td.hasAttribute('data-rendered')) {
            td._parent = tr;
            render_row(td, field, obj);
            td.setAttribute('data-rendered', '');
          } else if (field == 'msg_tr' && storage[guid]) {
            render_row(td, field, storage[guid]);
          } else if (field in data[i] || lang_user) {
            render_row(td, field, obj);
          }

          // vanished
          if (field == 'status' && obj == 2) {
            tr.setAttribute('hidden', '');
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
        tr.title = parseInt(i);

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

  function sortByColumns(evt) {
    const el = evt.target;

    if (el.classList.contains('sort')) {
      const th = el.parentElement;
      let sort = th.getAttribute('data-sort-column');
      let column = -1;
      let order = 0;
      if (sort != '1') {
        column = th.cellIndex;
        order = sort == '' ? 0 : ! parseInt(sort);
        sort = order ? 1 : 0;
      } else {
        sort = '';
      }

      for (const cell of thead.rows[0].cells) {
        cell.setAttribute('data-sort-column', '');
      }
      th.setAttribute('data-sort-column', sort);

      sort_table(column, order);

      try {
        localStorage.setItem('_tristate', JSON.stringify([column, order]));
      } catch (err) {
        console.error('sortByColumns', err);
      }
    }
  }

  function resume_sort() {
    try {
      let storage = localStorage.getItem('_tristate');
      let column = 7;
      let order = 1;

      if (storage) {
        const obj = JSON.parse(storage);
        column = obj[0];
        order = obj[1];
      }

      if (column != -1 && thead.rows[0].cells.item(column)) {
        const th = thead.rows[0].cells.item(column);
        const sort = order ? 1 : 0;
        th.setAttribute('data-sort-column', sort);

        sort_table(column, order);

        if (! storage) {
          localStorage.setItem('_tristate', JSON.stringify([column, order]));
        }
      }
    } catch (err) {
      console.error('resume_sort', err);
    }
  }

  function sort_table(column, order) {
    let rows = [];
    let items = [];
    let i = 0;

    if (column != -1) {
      for (const row of tbody.rows) {
        rows.push(row);
        let val = row.cells.item(column).textContent;
        if (isNaN(val)) {
          val = val.trim().toLowerCase().replace('&', '');
        } else {
          val = val ? parseFloat(val) : 0;
        }
        items.push([i++, val]);
      }
    } else {
      for (const row of tbody.rows) {
        rows.push(row);
        const val = parseInt(row.title);
        items.push([i++, val]);
      }
    }

    sort(items, order);

    while (tbody.firstChild) {
      tbody.removeChild(tbody.lastChild);
    }
    for (const i in items) {
      tbody.appendChild(rows[items[i][0]]);
    }
  }

  function sort(items, order) {
    items.sort(function(a, b) {
      if (typeof a[1] == 'string' && typeof b[1] == 'string') {
        return order ? b[1].localeCompare(a[1]) : a[1].localeCompare(b[1]);
      } else {
        return order ? b[1] - a[1] : a[1] - b[1];
      }
    });
  }

  function loader(xhr) {
    try {
      checker(xhr.status);

      const obj = JSON.parse(xhr.response);

      index(obj);
      render_table(obj);
      resume_sort();
    } catch (err) {
      fault(err);

      console.error('loader', err);
    }
  }

  function error(xhr) {
    message('reqerr');

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
      check_submit();
    }).catch(error);

    tbody.addEventListener('click', toggler);
    tbody.addEventListener('click', scrollToRow);
    tbody.addEventListener('input', _textInput);
    thead.addEventListener('click', sortByColumns);
    window.addEventListener('scroll', _scrollBody);
    load_submit_allow();
  }

  function unload() {
    body.classList.remove('ndm');
    tbody.removeEventListener('click', toggler);
    tbody.removeEventListener('click', scrollToRow);
    tbody.removeEventListener('input', _textInput);
    thead.addEventListener('click', sortByColumns);
    window.removeEventListener('scroll', _scrollBody);
    unload_submit_allow();
    page.removeEventListener('unload', unload);
  }

  load();
  page.addEventListener('unload', unload);
  view.removeAttribute('hidden');
}
