// TODO: This fixture might be too large, and if so should be split up.

function foo(pair: readonly [string, string]) {
  console.log(pair[0]); // okay
  pair[1] = 'hello!'; // error
}
