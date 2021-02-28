const b = ' ';
let c = ' ';
let d = '&amp;';
const e = {
  f: 'id=1&group=2',
  g(h = '&#123456789') {},
  i: (j = '&#123456789') => {},
};
e.i('&#x;');
