/*
 * backend/config.js
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

const basepath = '/backend';
const apipath = '/api';
const sourcespath = '/sources';
const routes = {
  '' : { '': main },
  'service': { '': service },
  'inspect': { '': list, 'add': edit, 'edit': edit },
  'test': { '': api_test },
  'login': { '': signin },
  'logout': { '': signout }
};
