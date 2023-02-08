// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function message(
  name: string,
  age: number = 100,
  ...args: Array<string>
): string {
  return name;
}
