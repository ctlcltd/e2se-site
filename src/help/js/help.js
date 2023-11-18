/* help/help.js */

const doc = document;
const body = doc.body;
const head = doc.getElementById('head');

function offCanvas(evt) {
  let el = evt.target;
  el = el.hasAttribute('data-target') ? el : el.closest('[data-target]');

  function close(evt) {
    const el = evt.target;

    if (el.className == 'backdrop') {
      backdrop(false);
      setTimeout(function() {
        body.classList.add('off');
      }, 50);
      setTimeout(function() {
        body._side.classList.remove('on');
        body.classList.remove('offcanvas');
        body.classList.remove('off');
        delete body._side;
      }, 100);
    }
  }

  function backdrop(toggle) {
    if (toggle) {
      const el = document.createElement('div');
      el.className = 'backdrop';
      body._backdrop = el;
      body.append(el);
      el.addEventListener('click', close);
    } else {
      const el = body._backdrop;
      el.removeEventListener('click', close);
      el.remove();
      delete body._backdrop;
    }
  }

  if (el) {
    const query = el.getAttribute('data-target');
    const side = doc.querySelector(query);

    if (body.classList.contains('offcanvas')) {
      if (side != body._side) {
        body.classList.remove('offcanvas');

        setTimeout(function() {
          body._side.classList.remove('on');
          body.classList.add('offcanvas');
          side.classList.add('on');
          body._side = side;
        }, 100);
      } else {
        backdrop(false);
        setTimeout(function() {
          body.classList.add('off');
        }, 50);
        setTimeout(function() {
          body._side.classList.remove('on');
          body.classList.remove('offcanvas');
          body.classList.remove('off');
          delete body._side;
        }, 100);
      }
    } else {
      body._side = side;
      body.classList.toggle('offcanvas');
      side.classList.toggle('on');
      backdrop(true);
    }

    setTimeout(function() {
      el.blur();
    }, 100);
  }
}

function inet() {
  if (navigator.onLine) {
    body.classList.add('online');
  } else {
    body.classList.remove('online');
  }
}

head.addEventListener('click', offCanvas);
window.addEventListener('online', inet);
window.addEventListener('offline', inet);
inet();
