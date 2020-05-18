function processOptional(one?: any) {
  one?.two!();
  one?.two!.three();
  (one?.two)!();
  (one?.two)!.three();
  (one?.two!)();
  (one?.two!).three();
}
