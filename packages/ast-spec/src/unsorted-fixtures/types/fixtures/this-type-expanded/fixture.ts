// TODO: This fixture might be too large, and if so should be split up.

class A {
  public a: number;

  public method(this: this): number {
    return this.a;
  }

  public method2(this: A): this {
    return this.a;
  }

  public method3(this: this): number {
    var fn = () => this.a;
    return fn();
  }

  public method4(this: A): number {
    var fn = () => this.a;
    return fn();
  }

  static staticMethod(this: A): number {
    return this.a;
  }

  static typeof(this: A): this {
    return typeof this;
  }
}
