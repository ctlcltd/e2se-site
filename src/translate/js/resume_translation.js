/*
 * translate/resume_translation.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function resume_translation(token) {
  const doc = document;
  const page = doc.getElementById('page');
  const field = doc.getElementById('token');

  function allowResume() {
    try {
      let allow = true;

      let storage;
      for (const lang in languages) {
        const tr_key = 'tr-' + lang;
        if (storage = localStorage.getItem(tr_key)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length > 1) {
            allow = false;
            break;
          }
        }
      }

      for (const lang in languages) {
        const obj = languages[lang];
        if (! obj.guid) {
          allow = false;
          break;
        }
      }

      if (allow) {
        const request = api_request('post', 'userland', 'resume', {token});

        page.setAttribute('data-loading', '');
        request.then(loader).catch(error);

        // field.value = '';
      } else {
        localStorage.setItem('_resume', token);
        localStorage.setItem('_lock', 'resume');

        message('edit-prev');
      }
    } catch (err) {
      console.error('allowResume', err);
    }
  }

  function loader(xhr) {
    page.removeAttribute('data-loading');

    try {
      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error(xhr);
      }

      let success = false;

      if (obj.data) {
        const data = obj.data;
        let lang_code;

        if (data.ulang) {
          const language = data.ulang;
          lang_code = language.code;
          languages[lang_code] = language;
          localStorage.setItem('languages', JSON.stringify(languages));
          success = true;
        } else if (data.lang) {
          for (const lang in languages) {
            const obj = languages[lang];
            if (obj.guid === data.lang) {
              lang_code = lang;
              break;
            }
          }
        }

        if (lang_code && data.data && data.data.utr) {
          const translation = data.data.utr;
          const tr_key = 'tr-' + lang_code;
          localStorage.setItem(tr_key, JSON.stringify(translation));
          success = true;
        } else {
          throw 'An error occurred';
        }
      } else {
        throw 'An error occurred';
      }

      if (success) {
        message('resumed');
      }
    } catch (err) {
      message('error');

      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);

    page.removeAttribute('data-loading');

    message('request-error');
  }

  if (validate_token(token)) {
    allowResume();
  } else {
    throw 'Not a valid token';
  }
}

function form_token() {
  const doc = document;
  const form = doc.querySelector('.token-form');
  const field = form.querySelector('#token');

  function textInput(evt) {
    if (evt.target === form) {
      evt.preventDefault();
    }

    const token = field.value;

    if (token.length === 10 && validate_token(token)) {
      field.setAttribute('disabled', '');
      resume_translation(token);
      field.removeAttribute('disabled');
    }
  }

  const _textInput = debounce(textInput, false, 50);

  field.addEventListener('input', _textInput);
  form.addEventListener('submit', textInput);
}

function your_token() {
  try {
    if (localStorage.getItem('_token')) {
      message('your-token');
    }
  } catch (err) {
    console.error('your_token', err);
  }
}

function token_box_html(type) {
  try {
    const token = localStorage.getItem('your-token');

    if (! validate_token(token)) {
      throw 'Not a valid token';
    }

    let html = '';

    if (type == 1) {
      html = '<p><b>Thank you for contribution</b></p>';
    }

    html += '<div>';
    html += '<p>Please take a note of your token</p>';
    html += '<p>This is useful to resume the translation you have sent</p>';
    html += '</div>';
    html += '<div><input type="text" id="your-token" value="' + token + '" readonly></div>';

    return html;
  } catch (err) {
    console.error('token_box_html', err);
  }
}

function token_box_dismiss() {
  try {
    localStorage.removeItem('_token');
  } catch (err) {
    console.error('token_box_dismiss', err);
  }
}

function validate_token(token) {
  return /[a-zA-Z0-9$&=@]{10}/g.test(token);
}
