// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class A {
  @configurable(true) static prop1;

  @configurable(false)
  static prop2;
}
