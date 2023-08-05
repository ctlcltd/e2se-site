/*
 * translate/resume_translation.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function resume_translation() {
  const doc = document;
  const page = doc.getElementById('page');

  const request = api_request('post', 'userland', 'token=' + token);

  function loader(xhr) {
    try {
      const obj = JSON.parse(xhr.response);

      if (obj.data) {
        const data = obj.data;

        // 

        if (data.ulang) {

        }
        if (data.utr) {

        }
      } else {
        throw 'An error occurred';
      }

      localStorage.setItem('languages', JSON.stringify(languages));
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);
  }

  page.setAttribute('data-loading', '');
  request.then(loader).catch(error);
  page.removeAttribute('data-loading');
}

function form_token() {
  const doc = document;
  const form = doc.querySelector('.token-form');
  const field = form.querySelector('#token');

  function textInput(evt) {
    const el = evt.target;

    if (el.value.length === 10 && validate_token(el.value)) {
      el.setAttribute('disabled', '');
      resume_translation();
      el.removeAttribute('disabled');
    }
  }

  const _textInput = debounce(textInput, false, 50);

  field.addEventListener('input', _textInput);
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

function token_box_html() {
  try {
    const token = localStorage.getItem('your-token');

    if (! validate_token(token)) {
      throw 'Not a valid token';
    }

    // 
    return '<p>Your token</p><div><input type="text" id="your-token" value="' + token + '" readonly></div>';
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
  return /[a-zA-Z$&=@]{10}/g.test(token);
}
