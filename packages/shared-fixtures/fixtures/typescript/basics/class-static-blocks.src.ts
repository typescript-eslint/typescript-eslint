class Foo {
  static count = 0;
  static {
    if (someCondition()) {
      count++;
    }
  }
}
