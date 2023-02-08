// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

type Foo = {
  h(bar: string): void;
  g<T>(bar: T): T;
};
