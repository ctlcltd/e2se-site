/*
 * translate/misc.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function what_this() {
  const what_this_areas = document.querySelectorAll('.what-this-area');
  if (what_this_areas.length) {
    for (const el of what_this_areas) {
      el.removeAttribute('hidden');
    }
  }
}

function send_translation() {
  const doc = document;
  const form = doc.querySelector('.submit-form');

  function submit_form(evt) {
    try {
      let valid = false;
      let storage;

      for (const lang in languages) {
        if (storage = localStorage.getItem(lang)) {
          storage = JSON.parse(storage);
          if (Object.keys(storage).length > 1) {
            valid = true;
            break;
          }
        }
      }

      if (! valid) {
        throw 'Not a valid submit';
      }

      

    } catch (err) {
      console.error('submit_form', err);
    }
  }

  form.addEventListener('submit', submit_form);
}

function token() {
  var w = 10;
  const a = [
    [ 48, 57 ],         // 0-9
    [ 97, 122 ],        // a-z
    [ 65, 90 ],         // A-Z
    [ 36, 38, 61, 64 ]  // $,&,=,@
  ];
  var s = '';

  while (w--) {
    let n;
    let i = Math.floor(Math.random() * 4);
    if (i == 3 && Math.random() * 100 < 50) {
      i = parseInt(Math.random() * 3);
    }
    if (i == 3) {
      n = Math.floor(Math.random() * a[i].length);
      n = a[i][n];
    } else {
      n = Math.floor((Math.random() * (a[i][1] - a[i][0] + 1)) + a[i][0]);
    }
    s += String.fromCharCode(n);
  }

  return s;
}

what_this();
send_translation();
