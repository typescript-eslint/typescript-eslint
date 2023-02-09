// TODO: This fixture might be too large, and if so should be split up.

class Foo {
  constructor(
    public firstName: string,
    public readonly lastName: string,
    public age: number = 30,
    public readonly student: boolean = false,
  ) {}
}
