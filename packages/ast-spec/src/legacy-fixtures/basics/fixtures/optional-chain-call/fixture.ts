// TODO: This fixture might be too large, and if so should be split up.

function processOptionalCall(one?: any) {
  one?.fn();
  one?.two.fn();
  one.two?.fn();
  one.two?.three.fn();
  one.two?.three?.fn();

  one?.();
  one?.()();
  one?.()?.();

  one?.().two;
}
