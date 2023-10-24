/*
 * backend/signout.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function signout() {
  sessionStorage.clear();

  function loader(xhr) {
    console.log('signout');
  }

  function error(xhr) {
    console.warn(xhr);
  }

  const request = api_request('post', 'logout');

  request.then(loader).catch(error);

  return route(basepath + '/?login');
}
