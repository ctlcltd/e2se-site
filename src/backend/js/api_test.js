/*
 * backend/api_test.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function api_test() {
  const doc = document;
  const view = doc.getElementById('api-test');
  const menu = view.querySelector('.nav');
  const request_form = doc.getElementById('api_request');
  const response_form = doc.getElementById('api_response');

  const methods = ['get', 'post'];
  const request = api_request('get', 'test');

  const endpoint_select = request_form.querySelector('[name="endpoint"]');
  const method_select = request_form.querySelector('[name="method"]');
  const route_select = request_form.querySelector('[name="route"]');
  const body_input = request_form.querySelector('[name="body"]');
  const response_status = response_form.querySelector('[name="response-status"]');
  const response_body = response_form.querySelector('[name="response-body"]');
  const response_headers = response_form.querySelector('[name="response-headers"]');

  nav(menu);

  function endpointChange() {
    try {
      if (! apiroutes) {
        return false;
      }

      const endpoint = endpoint_select.value;

      route_select.innerHTML = '';

      for (const route in apiroutes[endpoint]) {
        const sub = doc.createElement('option');
        sub.value = route;
        sub.innerText = route;
        route_select.appendChild(sub);
      }
    } catch (err) {
      console.error('endpointChange', err);
    }
  }

  function requestSubmit(evt) {
    evt.preventDefault();

    const method = method_select.value;
    const endpoint = endpoint_select.value;
    const route = route_select.value;
    const body = body_input.value;

    const request = api_request(method, endpoint, route, body);

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

  function response(xhr) {
    response_form.removeAttribute('data-loading');

    response_status.value = xhr.status;
    response_body.value = xhr.response;
    response_headers.value = xhr.getAllResponseHeaders();
  }

  function resume() {
    if (! apiroutes) {
      return false;
    }

    view.removeAttribute('hidden');

    requestReset();
  }

  function loader(xhr) {
    try {
      view.removeAttribute('hidden');

      const obj = JSON.parse(xhr.response);

      if (! obj.status) {
        return error(xhr);
      }

      apiroutes = obj.data;

      for (const method of methods) {
        const sub = doc.createElement('option');
        sub.value = method;
        sub.innerText = method.toUpperCase();
        method_select.appendChild(sub);
      }
      for (const endpoint in obj.data) {
        const sub = doc.createElement('option');
        sub.value = endpoint;
        sub.innerText = endpoint;
        endpoint_select.appendChild(sub);
      }

      view.setAttribute('data-render', '');

      endpointChange();
    } catch (err) {
      console.error('loader', err);
    }
  }

  function error(xhr) {
    console.warn(xhr);
  }

  request_form.addEventListener('submit', requestSubmit);
  request_form.addEventListener('reset', requestReset);
  endpoint_select.addEventListener('change', endpointChange);

  if (view.hasAttribute('data-render')) {
    resume();
  } else {
    request.then(loader).catch(error);
  }
}
