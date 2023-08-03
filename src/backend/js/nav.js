/*
 * backend/nav.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function nav(menu) {
  const nav = document.getElementById('nav').cloneNode(true);
  const nav_items = nav.querySelectorAll('a');

  function click(evt) {
    evt.preventDefault();

    route(this.href);

    return false;
  }

  for (const el of nav_items) {
    el.href = basepath + '/' + el.getAttribute('href');
    el.onclick = click;
  }

  nav.removeAttribute('id');
  nav.removeAttribute('hidden');

  navigation = nav;

  if (menu) {
    const nav = navigation.cloneNode(true);

    menu.replaceWith(navigation);
  }

  return navigation;
}
