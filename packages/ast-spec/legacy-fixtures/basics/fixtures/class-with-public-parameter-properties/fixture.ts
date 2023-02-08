// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  constructor(
    public firstName: string,
    public readonly lastName: string,
    public age: number = 30,
    public readonly student: boolean = false,
  ) {}
}
