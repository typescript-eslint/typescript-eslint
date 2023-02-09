// TODO: This fixture might be too large, and if so should be split up.

function processOptional(one?: any) {
  one?.two!();
  one?.two!.three();
  one?.two!();
  one?.two!.three();
  one?.two!();
  one?.two!.three();
}
