// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  constructor(
    readonly firstName: string,
    readonly lastName: string = 'Smith',
  ) {}
}
