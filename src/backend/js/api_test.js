/*
 * backend/api_test.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function api_test() {
  const view = document.getElementById('api-test');
  const menu = view.querySelector('.nav');
  const request_form = document.getElementById('api_request');
  const response_form = document.getElementById('api_response');
  const methods = ['get', 'post'];
  const request = api_request('get', '', '');
  const endpoint_select = request_form.querySelector('[name="endpoint"]');
  const method_select = request_form.querySelector('[name="method"]');
  const route_select = request_form.querySelector('[name="route"]');
  const body_input = request_form.querySelector('[name="body"]');
  const response_status = response_form.querySelector('[name="response-status"]');
  const response_body = response_form.querySelector('[name="response-body"]');
  const response_headers = response_form.querySelector('[name="response-headers"]');

  nav(menu);

  function response(xhr) {
    console.log('api_test()', 'response()', xhr);

    response_form.removeAttribute('data-loading');

    response_status.value = xhr.status;
    response_body.value = xhr.response;
    response_headers.value = xhr.getAllResponseHeaders();
  }

  function load(xhr) {
    console.log('api_test()', 'load()', xhr);

    try {
      view.removeAttribute('hidden');

      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error();
      }

      apiroutes = obj.data;

      for (const method of methods) {
        let option;
        option = document.createElement('option'), option.value = method, option.innerText = method.toUpperCase();
        method_select.appendChild(option);
      }
      for (const endpoint in obj.data) {
        let option;
        option = document.createElement('option'), option.value = endpoint, option.innerText = endpoint;
        endpoint_select.appendChild(option);
      }

      view.setAttribute('data-render', true);

      endpointChange();
    } catch (err) {
      console.error('api_test()', 'load()', err);
    }
  }

  function error() {
    view.setAttribute('hidden', '');

    return route(basepath + '/?login');
  }

  function resume() {
    console.log('api_test()', 'resume()');

    if (! apiroutes) throw 0;

    view.removeAttribute('hidden');

    requestReset();
  }

  function requestSubmit(evt) {
    evt && evt.preventDefault();

    const method = method_select.value;
    const endpoint = endpoint_select.value;
    const body = body_input.value;

    const request = api_request(method, endpoint, body);

    response_form.setAttribute('data-loading', '');

    request.then(response).catch(response);
  }

  function requestReset(evt) {
    evt && evt.preventDefault();

    body_input.value = '';
    route_select.value = '';
    endpoint_select.value = endpoint_select.options[0].value;

    endpointChange();

    method_select.value = method_select.options[0].value;
    route_select.value = route_select.options[0].value;
  }

  function endpointChange() {
    try {
      if (! apiroutes) throw 0;

      const endpoint = endpoint_select.value;

      route_select.innerHTML = '';

      for (const route in apiroutes[endpoint]) {
        let option;
        option = document.createElement('option'), option.value = route, option.innerText = route;
        route_select.appendChild(option);
      }
    } catch (err) {
      console.error('api_test()', 'endpointChange()', err);
    }
  }

  request_form.addEventListener('submit', requestSubmit);
  request_form.addEventListener('reset', requestReset);
  endpoint_select.addEventListener('change', endpointChange);

  if (view.hasAttribute('data-render')) {
    resume();
  } else {
    request.then(load).catch(error);
  }
}
