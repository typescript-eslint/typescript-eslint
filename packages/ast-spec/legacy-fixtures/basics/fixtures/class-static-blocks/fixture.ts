// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  static count = 0;
  static {
    if (someCondition()) {
      count++;
    }
  }
}
