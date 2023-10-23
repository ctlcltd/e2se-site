/*
 * backend/api_request.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function api_request(method, endpoint, route, data) {
  const xhr = new XMLHttpRequest();
  let url = apipath + '/';
  let body = null;

  if (method === 'get') {
    if (endpoint) {
      url += '?body=' + endpoint;
    }
    if (route) {
      url += endpoint ? '&' : '?' + '&call=' + route;
    }
    if (data) {
      url += endpoint || route ? '&' : '?' + data;
    }
  } else if (method === 'post') {
    body = 'body=' + endpoint;

    if (route) {
      body += '&call=' + route;
    }
    if (data) {
      body += '&' + data;
    }
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
