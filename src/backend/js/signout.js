/*
 * backend/signout.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function signout() {
  sessionStorage.clear();

  return route(basepath + '/?login');
}
