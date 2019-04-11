function foo(arr: ReadonlyArray<string>) {
  arr.slice();        // okay
  arr.push("hello!"); // error!
}

function foo(arr: readonly string[]) {
  arr.slice();        // okay
  arr.push("hello!"); // error!
}
