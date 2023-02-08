// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  #prop1;
  method(arg) {
    return #prop1 in arg;
  }
}
