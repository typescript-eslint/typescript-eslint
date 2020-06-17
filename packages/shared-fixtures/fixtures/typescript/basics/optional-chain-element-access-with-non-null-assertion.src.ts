function processOptional(one?: any) {
  one?.['two']!.three;
  (one?.['two'])!.three;
  (one?.['two']!).three;
  one?.two!['three'];
  (one?.two)!['three'];
  (one?.two!)['three'];
}
