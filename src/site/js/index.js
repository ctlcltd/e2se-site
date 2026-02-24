/* site/index.js */

const $document = document;
const $body = $document.body;
const $head = $document.getElementById('head');

function getPreferredColor(event) {
  let color = sessionStorage.getItem('preferred-color');
  color = color === 'light' || color === 'dark' ? color : null;
  color = color ?? (event && event.matches === 'dark' ? 'dark' : 'light');
  return color;
}

function colorScheme() {
  const mq = matchMedia('(prefers-color-scheme: dark)');

  const change = (event) => {
    colorTheme(event);
    loadImages(event);
  };

  mq.addEventListener('change', change);
  colorTheme();
}

function colorTheme(event) {
  const color = getPreferredColor(event);

  if (color) {
    $body.setAttribute('data-color', color);
    if (color === 'dark') {
      $body.classList.add('dark');
    } else {
      $body.classList.remove('dark');
    }
  }
}

function colorButton() {
  const button = $head.querySelector('#btn-color');

  const click = (event) => {
    const element = event.currentTarget;

    if (element) {
      let color = $body.hasAttribute('data-color') ? $body.getAttribute('data-color') : 'light';

      if (color === 'light' || color === 'dark') {
        const preferred = color === 'light' ? 'dark' : 'light';
        $body.setAttribute('data-color', preferred);

        if (color == 'light') {
          $body.classList.add('dark');
        } else {
          $body.classList.remove('dark');
        }

        setTimeout(() => {
          element.blur();
        }, 100);
        sessionStorage.setItem('preferred-color', preferred);
        loadImages();
      }
    }
  };

  button && button.addEventListener('click', click);
}

function fundButton() {
  const button = $head.querySelector('#btn-fund');

  const click = (event) => {
    const element = event.currentTarget;

    if (element) {
      setTimeout(() => {
        element.blur();
      }, 100);
      setTimeout(() => {
        window.location.href = '/donate.html';
      }, 300);
    }
  };

  button && button.addEventListener('click', click);
}

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
      if (side != $body._side) {
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
        setTimeout(function() {
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
  const mq = matchMedia('(min-width: 992px)');

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
  colorButton();
  fundButton();
}

function tooltips() {
  const AUTOHIDE_TIME = 7e3;
  const tooltips = [];

  const tip = (element) => {
    const tooltip = $document.createElement('div');
    const inner = $document.createElement('div');
    tooltip.className = 'tooltip';
    inner.className = 'inner';
    inner.innerText = element.dataset.tooltip;
    tooltip.append(inner);
    element.append(tooltip);
    element._tooltip = tooltip;
    tooltips.push(element);

    setTimeout(() => {
      close(element);
    }, AUTOHIDE_TIME);
  };
  const close = (element) => {
    if (element._tooltip) {
      element._tooltip.remove();
      delete element._tooltip;
    }
  };
  const tipEvent = (event) => {
    const element = event.target;

    if (element === event.currentTarget && ! element._tooltip) {
      for (const element of tooltips) {
        close.call(this, element);
      }
      tip.call(this, element);
    } else if (element._tooltip) {
      close.call(this, element);
    }
  };
  const bodyEvent = (event) => {
    const element = event.target;

    if (! element._tooltip) {
      for (const element of tooltips) {
        close.call(this, element);
      }
    }
  };

  for (const element of $document.querySelectorAll('[data-tooltip]')) {
    if (element.hasAttribute('title')) {
      element.dataset.tooltip = element.title;
      element.setAttribute('title', '');
      element.addEventListener('mouseenter', tipEvent);
    }
    element.addEventListener('click', tipEvent);
  }
  if ($document.querySelector('[data-tooltip]')) {
    $body.addEventListener('click', bodyEvent);
  }
}

function getPlatform() {
  const test = (ua) => {
    if (/win/i.test(ua)) {
      return 'w';
    } else if (/mac/i.test(ua) || /safari/i.test(ua)) {
      return 'm';
    }
  };

  return test(navigator.userAgent) ?? 'f';
}

function loadImages(event) {
  let color = getPreferredColor(event);
  let variation;
  let i = 0;

  for (const element of $document.querySelectorAll('.img img')) {
    element.disabled = true;
    element.removeAttribute('src');

    const platform = $body._platform ?? getPlatform();
    $body._platform = platform;
 
    let id = element.parentElement.className.substring(-1);
    let name = 'screenshot-';

    if (id === 'f') {
      id = 'a';
      name += 'sat-list-editor';
      variation = i++ ? 'd' : 'l';
    } else if (id === 'a' || id === 'b' || id === 'd' || id === 'e') {
      if (id === 'a') {
        name += 'sat-list-editor';
      } else if (id === 'b') {
        name += 'sat-channel-book';
      } else if (id === 'd') {
        name += 'edit-service-transponders-sat';
      } else if (id === 'e') {
        name += 'picons-editor-sat';
      }
      variation = variation ?? (color === 'dark' ? 'd' : 'l');
    } else {
      return;
    }

    const src = 'img/' + name + '_' + id + platform + variation + platform + '.svg';
    element.setAttribute('src', src);
    element.disabled = false;
  }
}

colorScheme();
loadImages();
navigation();
tooltips();
