// TODO: This fixture might be too large, and if so should be split up.

function processOptionalParens(one?: any) {
  one?.two;
  (one?.two).three;
  one.two?.three;
  (one.two?.three).four;
  one.two?.three?.four;
  (one.two?.three?.four).five;
}
