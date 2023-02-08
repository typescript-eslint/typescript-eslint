// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;
