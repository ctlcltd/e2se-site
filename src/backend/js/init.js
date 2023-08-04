/*
 * backend/init.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

var apiroutes;
var navigation;

function init() {
  try {
    sessionStorage.setItem('_test', '1');
    if (! sessionStorage.getItem('_test')) {
      throw 'Storage Error';
    }
    sessionStorage.removeItem('_test');
  } catch (err) {
    console.error(err);
  }

  function popState(evt) {
    route();
  }

  if (sessionStorage.getItem('backend')) {
    nav();
    route();
  } else {
    signin();
  }

  window.addEventListener('popstate', popState);
}

init();
