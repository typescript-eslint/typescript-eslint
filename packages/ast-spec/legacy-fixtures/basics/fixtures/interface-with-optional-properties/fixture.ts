// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

interface test {
  foo?;
  bar?: string;
  baz?(foo, bar?: string, baz?);
}
