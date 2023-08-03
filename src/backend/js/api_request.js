/*
 * backend/api_request.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function api_request(method, endpoint, route, body) {
  const xhr = new XMLHttpRequest();
  let url = apipath + '/';

  if (method === 'get') {
    url += endpoint ? '?body=' + endpoint : '';
    url += endpoint && route ? '&call=' + route : '';

    if (body) {
      url += '&' + body;
      body = null;
    }
  } else if (method === 'post') {
    body = 'body=' + endpoint + (route ? '&call=' + route : '') + '&' + body;
  } else {
    return new Promise(function(resolve, reject) {
      reject('Request Error');
    });
  }

  xhr.open(method, url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(body);

  return new Promise(function(resolve, reject) {
    xhr.onload = function() { resolve(xhr); };
    xhr.onerror = function() { reject(xhr); };
  });
}
