// TODO: This fixture might be too large, and if so should be split up.

class Foo {
  static count = 0;
  static {
    if (someCondition()) {
      count++;
    }
  }
}
