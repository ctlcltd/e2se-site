/*
 * translate/api_request.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function api_request(method, endpoint, route, data) {
  const xhr = new XMLHttpRequest();
  let url = apipath + '/';
  let body = null;

  const serialize = function(obj) {
    var data = [];
    try {
      for (const key of Object.keys(obj)) {
        let value = obj[key];
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        data.push(key + '=' + value.toString());
      }
    } catch (err) {
      console.error(err);
    }
    return data.join('&');
  };

  if (method === 'get') {
    if (endpoint) {
      url += '?body=' + endpoint;
    }
    if (route) {
      url += endpoint ? '&' : '?' + '&call=' + route;
    }
    if (data && typeof data === 'object') {
      url += endpoint || route ? '&' : '?' + serialize(data);
    }
  } else if (method === 'post') {
    body = 'body=' + endpoint;

    if (route) {
      body += '&call=' + route;
    }
    if (data && typeof data === 'object') {
      body += '&' + serialize(data);
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
