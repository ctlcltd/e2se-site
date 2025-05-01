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
        body._current.ariaExpanded = false;
        body.classList.remove('offcanvas');
        body.classList.remove('off');
        delete body._side, body._current;
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
          body._current.ariaExpanded = false;
          body.classList.add('offcanvas');
          side.classList.add('on');
          el.ariaExpanded = true;
          body._side = side;
          body._current = el;
        }, 100);
      } else {
        backdrop(false);
        setTimeout(function() {
          body.classList.add('off');
        }, 50);
        setTimeout(function() {
          body._side.classList.remove('on');
          body._current.ariaExpanded = false;
          body.classList.remove('offcanvas');
          body.classList.remove('off');
          delete body._side, body._current;
        }, 100);
      }
    } else {
      body._side = side;
      body._current = el;
      body.classList.toggle('offcanvas');
      side.classList.toggle('on');
      el.ariaExpanded = ! el.ariaExpanded != 'true';
      backdrop(true);
    }

    setTimeout(function() {
      el.blur();
    }, 100);
  }
}

function navmq() {
  const mq = matchMedia('(min-width:992px)');

  function change(evt) {
    if (evt.matches) {
      body.classList.remove('offcanvas');
      body.classList.remove('off');

      const backdrop = body.querySelector('.backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      for (const el of head.querySelectorAll('[data-target]')) {
        const query = el.getAttribute('data-target');
        const side = doc.querySelector(query);
        el.removeAttribute('aria-expanded');
        side.classList.remove('on');
      }

      delete body._side, body._current, body._backdrop;
    }
  }

  mq.addEventListener('change', change);
}

function inet() {
  if (navigator.onLine) {
    body.classList.add('online');
  } else {
    body.classList.remove('online');
  }
}

head.addEventListener('click', offCanvas);
navmq();
window.addEventListener('online', inet);
window.addEventListener('offline', inet);
inet();
