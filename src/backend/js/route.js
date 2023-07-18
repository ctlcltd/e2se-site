/*
 * backend/route.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function route(href, title) {
  const views = document.querySelectorAll('main');
  const history = href ? true : false;

  href = href ? href : window.location.href;
  title = title ? title : document.title;

  if (href.indexOf(basepath) === -1) {
    throw 'Wrong base path';
  }

  const url = href.replace(window.location.protocol + '//' + window.location.host, '');
  const path = url.split('?');
  const uri = path[1] && /&/.test(path[1]) == false ? path[1].split('&')[0] : '';
  const qs = path[1] ? path[1].split('&') : '';
  const key = qs[1] && qs[1] != uri ? qs[1] : '';
  const value = qs[2] && qs[1] != uri ? qs[2] : '';

  console.info('route()', { path, uri, qs, key, value });

  for (const view of views) {
    if (view.cloned) {
      view.remove();
    }

    view.setAttribute('hidden', '');
  }

  if (uri != undefined && uri in routes === false) {
    throw 'Wrong URI Route';
  }
  if (key != undefined && key in routes[uri] === false) {
    throw 'Wrong QueryString Route';
  }
  if (typeof routes[uri][key] != 'function') {
    throw 'Callable Function';
  }

  if (history) {
    window.history.pushState('', title, url);
  }

  routes[uri][key].call(this, uri, key, value);
}
