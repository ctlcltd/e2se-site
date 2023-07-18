/*
 * backend/main.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function main() {
  const view = document.getElementById('main');
  const menu = view.querySelector('.nav');

  nav(menu);

  view.removeAttribute('hidden');
}
