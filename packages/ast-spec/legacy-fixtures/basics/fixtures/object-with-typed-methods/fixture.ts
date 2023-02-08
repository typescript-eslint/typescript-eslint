// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

const foo = {
  constructor<T>(): number {
    return 1;
  },
  foo<T>(): number {
    return 1;
  },
  get a(): number {
    return 1;
  },
  set a(x: number): number {},
};
