class Foo {
  constructor(private firstName: string,
              private readonly lastName: string,
              private age: number = 30,
              private readonly student: boolean = false) {}
}