/* backend/main.js */

function main() {
  const view = document.getElementById('main');
  const menu = view.querySelector('.nav');

  nav(menu);

  view.removeAttribute('hidden');
}
