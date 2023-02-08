// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function isString(x: any): x is string {
  return typeof x === 'string';
}
