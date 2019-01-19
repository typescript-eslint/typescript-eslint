class Foo {
  constructor(public firstName: string,
              public readonly lastName: string,
              public age: number = 30,
              public readonly student: boolean = false) {}
}