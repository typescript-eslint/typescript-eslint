// TODO: This fixture might be too large, and if so should be split up.

class Foo {
  constructor(
    protected firstName: string,
    protected readonly lastName: string,
    protected age: number = 30,
    protected readonly student: boolean = false,
  ) {}
}
