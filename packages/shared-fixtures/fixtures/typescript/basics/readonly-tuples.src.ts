function foo(pair: readonly [string, string]) {
  console.log(pair[0]);   // okay
  pair[1] = "hello!";     // error
}
