/* site/index.js */

const doc = document;
const body = doc.body;
const head = doc.getElementById('head');
var theme;
// var platform;

function colorScheme() {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  theme = mq.matches;

  function change(evt) {
    theme = evt.matches;

    preferredColor();
    loadImages();
  }

  mq.addEventListener('change', change);
}

function preferredColor() {
  let color = sessionStorage.getItem('preferred-color');
  color = color == 'light' || color == 'dark' ? color : null;
  color = color ?? (theme ? 'dark' : 'light');

  if (color) {
    body.setAttribute('data-color', color);
    if (color == 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }
}

function switchColor(evt) {
  let el = evt.target;
  el = el.id == 'btn-color' ? el : el.closest('#btn-color');

  if (el) {
    let color = body.hasAttribute('data-color') ? body.getAttribute('data-color') : 'light';

    if (color == 'light' || color == 'dark') {
      const switched = color == 'light' ? 'dark' : 'light';
      body.setAttribute('data-color', switched);

      if (color == 'light') {
        body.classList.add('dark');
      } else {
        body.classList.remove('dark');
      }

      setTimeout(function() {
        el.blur();
      }, 100);

      sessionStorage.setItem('preferred-color', switched);
      loadImages();
    }
  }
}

function fundRaise(evt) {
  let el = evt.target;
  el = el.id == 'btn-fund' ? el : el.closest('#btn-fund');

  if (el) {
    setTimeout(function() {
      el.blur();
    }, 100);

    setTimeout(function() {
      window.location.href = '/donate.html';
    }, 300);
  }
}

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

function abbrbox() {
  function box(el) {
    const box = doc.createElement('div');
    const inner = doc.createElement('div');
    box.className = 'abbrbox';
    inner.className = 'inner';
    inner.innerText = el._title;
    box.append(inner);
    el.append(box);
    el._abbr = box;

    setTimeout(function() {
      body._abbrbox = el;
    }, 0);
    setTimeout(function() {
      close(el);
    }, 7e3);
  }

  function close(el) {
    if (el._abbr) {
      el._abbr.remove();
      delete el._abbr;
      delete body._abbrbox;
    }
  }

  function event(evt) {
    const el = evt.target;

    if (el.nodeName === 'ABBR' && ! el._abbr) {
      box.call(this, el);
    } else if (el._abbr) {
      close.call(this, el);
    } else if (body._abbrbox) {
      close.call(this, body._abbrbox);
    }
  }

  for (const el of doc.querySelectorAll('abbr')) {
    el._title = el.title;
    el.setAttribute('title', '');
    el.addEventListener('click', event);
    el.addEventListener('mouseenter', event);
  }
  body.addEventListener('click', event);
}

function platform_detect() {
  function test(s) {
    if (/win/i.test(s)) {
      return 'w';
    } else if (/mac/i.test(s) || /safari/i.test(s)) {
      return 'm';
    }
  }
  return (test(navigator.platform) ?? test(navigator.useragent)) ?? 'f';
}

function loadImages(evt) {
  let color = sessionStorage.getItem('preferred-color');
  color = color == 'light' || color == 'dark' ? color[0] : null;
  let i = 0;

  for (const el of doc.querySelectorAll('.img img')) {
    el.disabled = true;
    el.removeAttribute('src');

    // 
    window.platform = window.platform ?? platform_detect();
    // platform = platform ?? platform_detect();

    let id = el.parentElement.className.substr(-1);
    let img = 'screenshot-';

    if (id == 'f') {
      id = 'a';
      img += 'sat-list-editor';
      color = i++ ? 'd' : 'l';
    } else if (id == 'a' || id == 'b' || id == 'd' || id == 'e') {
      if (id == 'a') {
        img += 'sat-list-editor';
      } else if (id == 'b') {
        img += 'sat-channel-book';
      } else if (id == 'd') {
        img += 'edit-service-transponders-sat';
      } else if (id == 'e') {
        img += 'picons-editor-sat';
      }
      color = color ?? (theme ? 'd' : 'l');
    } else {
      return;
    }

    const src = 'img/' + img + '_' + id + platform + color + platform + '.svg';
    el.setAttribute('src', src);
    el.disabled = false;
  }
}

colorScheme();
preferredColor();
head.addEventListener('click', switchColor);
head.addEventListener('click', fundRaise);
head.addEventListener('click', offCanvas);
loadImages();
abbrbox();
navmq();
