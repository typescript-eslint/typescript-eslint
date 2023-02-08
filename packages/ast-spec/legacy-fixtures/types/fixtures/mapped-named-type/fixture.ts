// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

type Test<T> = {
  [P in keyof T as 'a']: T[P];
};
