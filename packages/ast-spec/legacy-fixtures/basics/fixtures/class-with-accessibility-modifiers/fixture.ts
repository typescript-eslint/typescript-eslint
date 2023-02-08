// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

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
