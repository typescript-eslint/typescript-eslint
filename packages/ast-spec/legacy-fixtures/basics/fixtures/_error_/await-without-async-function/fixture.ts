// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function foo() {
  const bar = await baz();
  return bar.qux;
}
