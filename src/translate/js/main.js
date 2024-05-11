/* translate/main.js */

function main() {
  // console.log('main()');

  const doc = document;
  doc.title = 'Translations';
  doc.description.setAttribute('content', 'Translation website for e2 SAT Editor');
  urlc();

  const view = doc.getElementById('main');

  const fields = {
    'locale': 'Language',
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

  function check_submit() {
    if (! doc.getElementById('ctrbar-submit-form').hasAttribute('hidden')) {
      return;
    }
    try {
      let storage;
      for (const lang in languages) {
        const tr_key = 'tr-' + lang;
        if (storage = localStorage.getItem(tr_key)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length != 0) {
            doc.getElementById('ctrbar-add-language').setAttribute('hidden', '');
            doc.getElementById('ctrbar-submit-form').removeAttribute('hidden');
            doc.querySelector('.submit-form').classList.remove('placeholder');
            break;
          }
        }
      }
    } catch (err) {
      console.error('check_submit', err);
    }
  }

  function render_row(td, field, obj) {
    if (field == 'completed') {
      if (! td._element) {
        const level = doc.createElement('span');
        level.className = 'level';
        level.title = obj.toString() + '%';
        level.dataset.completed = obj.toString();
        level.style = '--completed: ' + obj.toString() + '%;';
        td.append(level);
        td._element = level;
      }
    } else if (field == 'revised') {
      if (! td._element) {
        const revised = doc.createElement('span');
        revised.className = 'revised';
        revised.innerText = obj ? 'yes' : 'none';
        td.append(revised);
        td._element = revised;
      }
    } else if (obj) {
      td.innerText = obj.toString();
    }
  }

  function animation() {
    var i = tbody.rows.length;

    while (i--) {
      tbody.rows.item(i).removeAttribute('data-animated');
      tbody.rows.item(i).style = '--delay: ' + (i * 20) + 'ms;';
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

    for (const i in data) {
      const guid = data[i]['guid'].toString();
      const lang_code = data[i]['code'].toString();
      const lang_type = data[i]['type'].toString();
      const lang_dir = data[i]['dir'].toString();

      const el_tr = tbody.querySelector('[data-guid="' + guid + '"]');
      const tr = el_tr ? el_tr : doc.createElement('tr');

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
          } else if (field in data[i]) {
            render_row(td, field, obj);
          }

          // revised
          if (field == 'revised' && obj) {
            tr.classList.add('revised');
          }

          if (! el_td) {
            tr.append(td);
          }
        }
      }

      if (! el_tr) {
        if (tr_tpl) {
          for (const td of tr_tpl.children) {
            if (td != tr_tpl.firstElementChild) {
              tr.append(td.cloneNode(true));
            }
          }
        }

        const action_edit = tr.querySelector('span.action-edit > a');
        action_edit.href += '?lang=' + lang_code;
        tr.setAttribute('data-guid', guid);
        tr.setAttribute('data-type', lang_type);
        tr.setAttribute('data-dir', lang_dir);
        tr.setAttribute('data-href', action_edit.href);
        tr.setAttribute('data-animated', '');
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

  function load() {
    doc.getElementById('ctrbar-add-language').removeAttribute('hidden');
    doc.getElementById('ctrbar-submit-form').setAttribute('hidden', '');
    doc.querySelector('.submit-form').classList.add('placeholder');

    if (! languages) {
      return false;
    }
    if (! table.hasAttribute('data-rendered')) {
      table.setAttribute('data-loading', '');
      render_table(languages);
    }
    check_submit();
    setTimeout(function() {
      animation();
    }, 300);
  }

  load();
  view.removeAttribute('hidden');
}
