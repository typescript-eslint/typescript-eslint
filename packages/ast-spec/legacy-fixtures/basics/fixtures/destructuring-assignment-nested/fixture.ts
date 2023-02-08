// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

({
  foo: { bar: { baz: [a, { foo: [x] = [3] } = { foo: [2] }] = [] } = {} } = {},
} = { foo: { bar: { baz: [2, { foo: [3] }] } } });
