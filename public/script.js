/*!
 * script.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */
(function() {


const doc = document;
const body = doc.body;

function preferredColor() {
  const color = sessionStorage.getItem('preferred-color');

  if (color == 'light' || color == 'dark') {
    body.setAttribute('data-color', color);
    if (color == 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }

    const button = doc.getElementById('switch-color');
    button.innerText = 'switch to ' + (color == 'light' ? 'dark' : 'light');
  }
}

function switchColor(evt) {
  const el = evt.target;
  if (el.id == 'switch-color') {
    let color = body.hasAttribute('data-color') ? body.getAttribute('data-color') : 'light';

    if (color == 'light' || color == 'dark') {
      const switched = color == 'light' ? 'dark' : 'light';
      el.innerText = 'switch to ' + color;
      body.setAttribute('data-color', switched);

      if (color == 'light') {
        body.classList.add('dark');
      } else {
        body.classList.remove('dark');
      }

      setTimeout(function() {
        el.blur();
      }, 100);

      sessionStorage.setItem('preferred-color', switched);
    }
  }
}

preferredColor();
doc.getElementById('head').addEventListener('click', switchColor);

})();