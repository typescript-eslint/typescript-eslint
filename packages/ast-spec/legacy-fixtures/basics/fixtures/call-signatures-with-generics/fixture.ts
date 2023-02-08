// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

type foo = {
  <T>(a: string): string;
  new <T>(a: string): string;
};
