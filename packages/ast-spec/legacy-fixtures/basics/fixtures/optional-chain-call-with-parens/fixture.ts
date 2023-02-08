// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function processOptionalCallParens(one?: any) {
  one?.fn();
  (one?.two).fn();
  one.two?.fn();
  (one.two?.three).fn();
  one.two?.three?.fn();

  one?.();
  (one?.())();
  one?.()?.();

  (one?.()).two;
}
