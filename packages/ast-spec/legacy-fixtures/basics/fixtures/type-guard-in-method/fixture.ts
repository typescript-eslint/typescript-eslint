// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  isBar(): this is string {
    return this instanceof Foo;
  }
  isBaz = (): this is string => {
    return this instanceof Foo;
  };
}
