// TODO: This fixture might be too large, and if so should be split up.

class Foo {
  isBar(): this is string {
    return this instanceof Foo;
  }
  isBaz = (): this is string => {
    return this instanceof Foo;
  };
}
