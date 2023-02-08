// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  constructor(
    private firstName: string,
    private readonly lastName: string,
    private age: number = 30,
    private readonly student: boolean = false,
  ) {}
}
