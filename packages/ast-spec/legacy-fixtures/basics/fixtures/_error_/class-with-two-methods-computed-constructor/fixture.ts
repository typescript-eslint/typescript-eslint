// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class A {
  constructor<T>(): number {}

  ['constructor']<T>(): number {}
}
