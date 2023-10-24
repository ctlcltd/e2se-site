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
      html = '<p><b>WebStorage is required</b></p><p>localStorage seems to be unavailable</p><p>Please reload your browser and try again</p>';
    } else if (id == 'langexists') {
      html = '<p>Language already exists</p>';
      type = 0;
    } else if (id == 'reqerr') {
      html = '<p><b>An error occurred<b></p><p>Please try again</p>';
      type = 0;
    } else if (id == 'editprev') {
      html = '<p>You have a previous translation edit that was not sent</p><p><b>Do you want to SUBMIT or DISCARD the previous edit?</b></p>';
      type = 2;
      buttons = [
        {'label': 'Submit', 'class': 'primary', 'callback': send_translation},
        {'label': 'Discard', 'class': 'secondary tiny', 'callback': discard_edit},
        {'label': 'Cancel', 'class': 'tiny', 'callback': close}
      ];
    } else if (id == 'token') {
      html = token_box_html(type);
      if (! html) {
        return message('error');
      }
      type = 1;
      buttons = [
        {'label': 'Dismiss', 'class': 'secondary tiny', 'callback': token_box_dismiss}
      ];
    } else if (id == 'reset') {
      html = '<p>RESET DATA</p><p>This will re-initialize data</p><p><b>Do you want to RESET all data?</b></p>';
      type = 2;
      buttons = [
        {'label': 'Reset', 'class': 'primary', 'callback': reset_data},
        {'label': 'Cancel', 'class': 'tiny', 'callback': close}
      ];
    } else if (id == 'cleared') {
      html = '<p><b>Session cleared!<b></p>';
      type = 1;
    } else if (id == 'resumed') {
      html = '<p><b>Session resumed!<b></p>';
      type = 1;
    } else if (id == 'busy') {
      html = '<p><b>Service is busy</b></p><p>You have reach the send limit quota</p><p>Please wait few seconds and try again</p>';
      type = 0;
    } else if (id == 'error') {
      html = '<p><b>An error occurred<b></p>';
      type = 0;
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
    if (! buttons) {
      buttons = [
        {'label': 'OK', 'class': 'secondary tiny', 'callback': close}
      ];
    }
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

function fault(err) {
  switch (err) {
    case 429:
    case 503:
      message('busy');
    break;
    default:
      message('error');
  }
}

function except(id) {
  switch (id) {
    case 1: return 'An error occurred';
    case 2: return 'Storage Error';
    case 3: return 'Wrong base path';
    case 4: return 'Wrong URI Route';
    case 6: return 'No Function Route';
    case 8: return 'Not a valid submit';
    case 10: return 'Not a valid translation submit';
    case 12: return 'Not a valid token';
    case 13: return 'Language already exists';
  }
}

function checker(status) {
  if (! status) {
    throw except(1);
  }
  if (status > 399) {
    throw status;
  }
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

function reset_data(front) {
  const request = source_request('langs');

  function done(xhr) {
    try {
      checker(xhr.status);

      const obj = JSON.parse(xhr.response);

      languages = obj;

      localStorage.setItem('languages', JSON.stringify(languages));
    } catch (err) {
      fault(err);

      console.error('done', err);
    }
  }

  function error(xhr) {
    message('reqerr');

    console.warn(xhr);
  }

  try {
    const color = localStorage.getItem('preferred-color');

    localStorage.clear();

    localStorage.setItem('_time', new Date().toJSON());

    if (color == 'light' || color == 'dark') {
      localStorage.setItem('preferred-color', color);
    }

    request.then(done).catch(error);

    if (front !== false) {
      message('cleared');

      route(basepath + '/');
    }
  } catch (err) {
    console.error('reset_data', err);
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
