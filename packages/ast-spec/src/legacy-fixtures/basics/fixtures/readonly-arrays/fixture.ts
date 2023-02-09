// TODO: This fixture might be too large, and if so should be split up.

function foo(arr: ReadonlyArray<string>) {
  arr.slice(); // okay
  arr.push('hello!'); // error!
}

function foo(arr: readonly string[]) {
  arr.slice(); // okay
  arr.push('hello!'); // error!
}
