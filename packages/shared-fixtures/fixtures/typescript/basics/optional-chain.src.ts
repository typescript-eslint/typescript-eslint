function processOptional(one?: any) {
  one?.two;
  one?.two.three;
  one.two?.three;
  one.two?.three.four;
  one.two?.three?.four;
}
