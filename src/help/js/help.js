/* help/help.js */

const doc = document;
const body = doc.body;
const head = doc.getElementById('head');

// 
function offCanvas(evt) {
  let el = evt.target;
  el = el.hasAttribute('data-target') ? el : el.closest('[data-target]');

  function close(evt) {
    const el = evt.target;

    if (el.className == 'backdrop') {
      const sides = doc.querySelectorAll('#side aside');
      body.classList.remove('offcanvas');
      body._backdrop.remove();
    }
  }

  function backdrop() {
    const el = document.createElement('div');
    el.className = 'backdrop';
    body._backdrop = el;
    body.append(el);
    body.addEventListener('click', close);
  }

  function toggle(el) {
    if (body.classList.contains('offcanvas')) {
      body.removeEventListener('click', close);
    } else {
      backdrop();
    }
    if (el) {
      body.classList.toggle('offcanvas');
      el.classList.toggle('on');
    }
  }

  if (el) {
    const query = el.getAttribute('data-target');
    const side = doc.querySelector(query);
    console.log(query);

    toggle(side);

    setTimeout(function() {
      el.blur();
    }, 100);
  }
}

head.addEventListener('click', offCanvas);
