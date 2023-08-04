/*
 * backend/route.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function route(href, title) {
  const views = document.querySelectorAll('main');
  const history = href ? true : false;

  href = href ?? window.location.href;
  title = title ?? document.title;

  if (href.indexOf(basepath) === -1) {
    throw 'Wrong base path';
  }

  const url = href.replace(window.location.protocol + '//' + window.location.host, '');
  const root = url.split('?');
  const uri = root[1] && /&/.test(root[1]) == false ? root[1].split('&')[0] : '';
  const qs = root[1] ? root[1].split('&') : '';
  const path = qs[1] && qs[1] != uri ? qs[1] : '';
  let search = {};

  if (qs[2] && qs[1] != uri) {
    for (let c in qs[2].slice(1)) {
      c = c.split('=');
      search[c[0]] = c[1];
    }
  }

  console.info('route', { qs, uri, path, search });

  for (const view of views) {
    if (view._cloned) {
      view.remove();
    }

    view.setAttribute('hidden', '');
  }

  if (uri != undefined && uri in routes === false) {
    throw 'Wrong URI Route';
  }
  if (path != undefined && path in routes[uri] === false) {
    throw 'Wrong Path Route';
  }
  if (typeof routes[uri][path] != 'function') {
    throw 'Callable Function';
  }

  if (history) {
    window.history.pushState('', title, url);
  }

  routes[uri][path].call(this, uri, path, search);
}
