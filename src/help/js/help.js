/* help/help.js */

const doc = document;
const body = doc.body;
const head = doc.getElementById('head');

function offCanvas(evt) {
  let el = evt.target;
  el = el.hasAttribute('data-target') ? el : el.closest('[data-target]');
}

head.addEventListener('click', offCanvas);
