/*
 * translate/misc.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

function styles() {
  const what_this_areas = document.querySelectorAll('.what-this-area');
  if (what_this_areas.length) {
    for (const el of what_this_areas) {
      el.removeAttribute('hidden');
    }
  }
}

styles();
