// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function processOptionalParens(one?: any) {
  one?.two;
  (one?.two).three;
  one.two?.three;
  (one.two?.three).four;
  one.two?.three?.four;
  (one.two?.three?.four).five;
}
