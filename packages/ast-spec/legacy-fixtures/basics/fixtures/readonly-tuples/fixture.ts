// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function foo(pair: readonly [string, string]) {
  console.log(pair[0]); // okay
  pair[1] = 'hello!'; // error
}
