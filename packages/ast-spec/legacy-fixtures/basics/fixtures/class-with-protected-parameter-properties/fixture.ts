// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  constructor(
    protected firstName: string,
    protected readonly lastName: string,
    protected age: number = 30,
    protected readonly student: boolean = false,
  ) {}
}
