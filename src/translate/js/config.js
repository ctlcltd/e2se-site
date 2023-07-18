/*
 * translate/config.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

const basepath = '/translate';
const apipath = '/api';
const sourcespath = '/sources';
const routes = {
  '' : { '': main },
  'edit.html': { '': edit_translate },
  'add-language.html': { '': add_language }
};
