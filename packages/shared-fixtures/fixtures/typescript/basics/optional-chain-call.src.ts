function processOptionalCall(one?: any) {
  one?.fn();
  one?.two.fn();
  one.two?.fn();
  one.two?.three.fn();
  one.two?.three?.fn();

  one?.();
  one?.()?.();

  one?.().two;
}
