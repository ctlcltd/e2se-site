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
    sessionStorage.setItem('backendTest', '1');
    if (! sessionStorage.getItem('backendTest')) {
      throw 'Storage Error';
    }
    sessionStorage.removeItem('backendTest');
  } catch (err) {
    console.error(err);
  }

  function popState(evt) {
    route();
  }

  if (sessionStorage.getItem('backendSign')) {
    nav();
    route();
  } else {
    signin();
  }

  window.addEventListener('popstate', popState);
}

init();
