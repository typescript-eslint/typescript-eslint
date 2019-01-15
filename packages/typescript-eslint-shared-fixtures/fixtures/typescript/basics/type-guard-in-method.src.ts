class Foo {
  isBar(): this is string {
    return this instanceof Foo;
  }
  isBaz = (): this is string => {
    return this instanceof Foo;
  }
}
