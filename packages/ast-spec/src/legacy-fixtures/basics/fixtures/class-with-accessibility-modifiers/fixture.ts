// TODO: This fixture might be too large, and if so should be split up.

class Foo {
  private bar: string;
  public static baz: number;
  public getBar() {
    return this.bar;
  }
  protected setBar(bar: string) {
    this.bar = bar;
  }
}
