/*
 * translate/route.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function route(href, title) {
  const page = document.getElementById('page');
  const views = document.querySelectorAll('main');
  const history = href ? true : false;

  href = href ?? window.location.href;
  title = title ?? document.title;

  if (href.indexOf(basepath) === -1) {
    throw 'Wrong base path';
  }

  const url = href.replace(window.location.protocol + '//' + window.location.host, '');
  const root = url.split('?');
  const uri = root[0].split('/')[2];
  const qs = root[1] ? root[1].split('&') : '';
  let search = {};

  if (qs) {
    for (let c of qs) {
      c = c.split('=');
      search[c[0]] = c[1];
    }
  }

  console.info('route', { qs, uri, search });

  for (const view of views) {
    if (view._cloned) {
      view.remove();
    }

    view.setAttribute('hidden', '');
  }

  if (uri != undefined && uri in routes === false) {
    throw 'Wrong URI Route';
  }
  if (typeof routes[uri] != 'function') {
    throw 'No Function Route';
  }

  const e = new Event('unload');
  page.dispatchEvent(e);

  if (history) {
    window.history.pushState('', title, url);
  }

  routes[uri].call(this, uri, search);
}
