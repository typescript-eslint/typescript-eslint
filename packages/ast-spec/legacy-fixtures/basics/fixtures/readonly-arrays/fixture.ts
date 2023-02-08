// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function foo(arr: ReadonlyArray<string>) {
  arr.slice(); // okay
  arr.push('hello!'); // error!
}

function foo(arr: readonly string[]) {
  arr.slice(); // okay
  arr.push('hello!'); // error!
}
