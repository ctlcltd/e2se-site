/*
 * translate/init.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

let languages;
let navigation;

function init() {
  const name = 'langs';
  const request = source_request(name);

  function load(xhr) {
    try {
      languages = JSON.parse(xhr.response);

      route();
    } catch (err) {
      console.error('init()', 'load()', err);

      error(null, err);
    }
  }

  function resume() {

  }

  function popState(evt) {
    console.log('popState()', evt);
    route();
  }

  function error(xhr, err) {
    console.error('init()', 'error()', xhr || '', err || '');
  }

  request.then(load).catch(error);
  window.addEventListener('popstate', popState);
}

init();
