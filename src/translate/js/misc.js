/*
 * translate/misc.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function message(id, text, type, buttons) {
  const doc = document;
  const box = doc.createElement('div');

  function close() {
    doc.body.classList.remove('backdrop');
    msg = null;

    setTimeout(function() {
      box.remove();
    }, 150);
  }

  if (id) {
    let html;

    if (id == 'storage') {
      html = '<p><b>WebStorage is required</b></p><p>localStorage seems to be unavailable<br>Please reload your browser and try again</p>';
    } else if (id == 'lang-exists') {
      html = '<p>Language already exists</p>';
      type = 0;
    } else if (id == 'request-error') {
      html = '<p><b>An error occurred<b></p><p>Please try again</p>';
      type = 0;
    } else if (id == 'edit-prev') {
      html = '<p>You have a previous translation edit that was not sent</p><p><b>Do you want to submit or discard the previous edit?</b></p>';
      type = 2;
      buttons = [
        {'label': 'Submit', 'class': 'primary', 'callback': send_translation},
        {'label': 'Discard', 'class': 'secondary tiny', 'callback': discard_edit},
        {'label': 'Cancel', 'class': 'tiny', 'callback': close}
      ];
    } else if (id == 'your-token') {
      html = token_box_html(type);
      type = 1;
      buttons = [
        {'label': 'Dismiss', 'class': 'secondary tiny', 'callback': token_box_dismiss}
      ];
    }

    box.innerHTML = html;
  } else if (text) {
    box.innerText = text;
  } else {
    return;
  }

  box.className = 'message-box';
  if (type === 0) {
    box.className += ' error';
  } else if (type === 1) {
    box.className += ' success';
  } else if (type === 2) {
    box.className += ' ask';
  }

  if (type != undefined) {
    doc.body.classList.add('backdrop');
    box.className += ' top';
    btns = [
      {'label': 'OK', 'callback': close}
    ];
  }

  if (buttons && typeof buttons == 'object') {
    const btns = doc.createElement('div');
    btns.className = 'feedback';

    for (const btn of buttons) {
      const button = doc.createElement('button');
      if (btn.class) {
        button.className += btn.class;
      }
      button.innerText = btn.label;
      if (btn.callback && typeof btn.callback == 'function') {
        button.onclick = function(evt) {
          close();
          btn.callback.call(this, evt);
        };
      }
      btns.append(button);
    }

    box.append(btns);
  }

  if (msg) {
    msg.replaceWith(box);
  } else {
    doc.body.append(box);
  }
  msg = box;
}

function what_this() {
  const what_this_areas = document.querySelectorAll('.what-this-area');
  if (what_this_areas.length) {
    for (const el of what_this_areas) {
      el.removeAttribute('hidden');
    }
  }
}

function discard_edit() {
  try {
    for (const lang in languages) {
      const tr_key = 'tr-' + lang;
      if (localStorage.getItem(tr_key)) {
        localStorage.removeItem(tr_key);
      }
    }

    if (localStorage.getItem('_lock') == 'resume') {
      const token = localStorage.getItem('_resume');

      resume_translation(token);

      localStorage.removeItem('_lock');
      localStorage.removeItem('_resume');
    }
  } catch (err) {
    console.error('discard_edit', err);
  }
}

function debounce(fn, once, timeout) {
  timeout = timeout ?? 300;
  let timer;

  if (once) {
    return (function() {
      if (! timer) {
        fn.apply(this, arguments);
      }
      clearTimeout(timer);
      timer = setTimeout(function() {
        timer = undefined;
      }, timeout);
    });
  } else {
    return (function() {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(this, args);
      }, timeout);
    });
  }
}

what_this();
