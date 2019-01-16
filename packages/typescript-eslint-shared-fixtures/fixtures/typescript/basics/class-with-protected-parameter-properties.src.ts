class Foo {
  constructor(protected firstName: string,
              protected readonly lastName: string,
              protected age: number = 30,
              protected readonly student: boolean = false) {}
}