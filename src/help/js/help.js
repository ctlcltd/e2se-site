/* help/help.js */

const $document = document;
const $body = $document.body;
const $head = $document.getElementById('head');

function offCanvas(event) {
  const element = event.currentTarget;

  const close = (event) => {
    const element = event.currentTarget;

    if (element.className === 'backdrop') {
      backdrop(false);
      setTimeout(() => {
        $body.classList.add('off');
      }, 50);
      setTimeout(() => {
        $body._side.classList.remove('on');
        $body._current.ariaExpanded = false;
        $body.classList.remove('offcanvas');
        $body.classList.remove('off');
        delete $body._side;
        delete $body._current;
      }, 100);
    }
  };
  const backdrop = (toggle) => {
    if (toggle) {
      const element = document.createElement('div');
      element.className = 'backdrop';
      $body._backdrop = element;
      $body.append(element);
      element.addEventListener('click', close);
    } else {
      const element = $body._backdrop;
      element.removeEventListener('click', close);
      element.remove();
      delete $body._backdrop;
    }
  };

  if (element) {
    const query = element.getAttribute('data-target');
    const side = $document.querySelector(query);

    if ($body.classList.contains('offcanvas')) {
      if (side !== $body._side) {
        $body.classList.remove('offcanvas');
        setTimeout(() => {
          $body._side.classList.remove('on');
          $body._current.ariaExpanded = false;
          $body.classList.add('offcanvas');
          side.classList.add('on');
          element.ariaExpanded = true;
          $body._side = side;
          $body._current = element;
        }, 100);
      } else {
        backdrop(false);
        setTimeout(() => {
          $body.classList.add('off');
        }, 50);
        setTimeout(() => {
          $body._side.classList.remove('on');
          $body._current.ariaExpanded = false;
          $body.classList.remove('offcanvas');
          $body.classList.remove('off');
          delete $body._side;
          delete $body._current;
        }, 100);
      }
    } else {
      $body._side = side;
      $body._current = element;
      $body.classList.toggle('offcanvas');
      side.classList.toggle('on');
      element.ariaExpanded = ! element.ariaExpanded !== 'true';
      backdrop(true);
    }
    setTimeout(() => {
      element.blur();
    }, 100);
  }
}

function navigation() {
  const mq = matchMedia('(min-width:992px)');

  const change = (event) => {
    if (event.matches) {
      $body.classList.remove('offcanvas');
      $body.classList.remove('off');

      const backdrop = $body.querySelector('.backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      for (const element of $head.querySelectorAll('[data-target]')) {
        const query = element.getAttribute('data-target');
        const side = $document.querySelector(query);
        element.removeAttribute('aria-expanded');
        side.classList.remove('on');
      }
      delete $body._side;
      delete $body._current;
      delete $body._backdrop;
    }
  };

  for (const button of $head.querySelectorAll('[data-target]')) {
    button.addEventListener('click', offCanvas);
  }
  mq.addEventListener('change', change);
}

function sidebar() {
  const connected = () => {
    if (navigator.onLine) {
      $body.classList.add('online');
    } else {
      $body.classList.remove('online');
    }
  }

  window.addEventListener('online offline', connected);
  connected();
}

navigation();
sidebar();
