// TODO: This fixture might be too large, and if so should be split up.

function processOptional(one?: any) {
  one?.two!.three;
  (one?.two)!.three;
  (one?.two)!.three;
}
