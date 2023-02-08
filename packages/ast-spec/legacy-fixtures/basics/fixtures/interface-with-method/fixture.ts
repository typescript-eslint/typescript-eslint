// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

interface test {
  h(bar: string): void;
  g<T>(bar: T): T;
}
