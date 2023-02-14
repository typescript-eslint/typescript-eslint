// TODO: This fixture might be too large, and if so should be split up.

class Foo {
  constructor(
    private firstName: string,
    private readonly lastName: string,
    private age: number = 30,
    private readonly student: boolean = false,
  ) {}
}
