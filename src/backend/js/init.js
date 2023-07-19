/*
 * backend/init.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

let apiroutes;
let navigation;

function init() {
  var tc_value = '1; ';
  var tc_path = 'path=' + basepath + '; ';
  var tc_secured = ''; //'secure; ';
  var tc_expires = 'expires=' + new Date(new Date().getTime() + (60 * 1e3)).toGMTString() + '; ';

  document.cookie = 'backend-test=' + tc_value + tc_path + tc_expires + tc_secured + 'samesite=strict';

  if (document.cookie.indexOf('backend-test') == -1) {
    return;
  }

  function popState(evt) {
    route();
  }

  if (document.cookie.indexOf('backend-sign') != -1) {
    nav();
    route();
  } else {
    signin();
  }

  window.addEventListener('popstate', popState);
}

init();
