const outer = 1;
type Outer = 1;
class A {
  constructor(
    private a,
    private b = 1,
    private c = a,
    public d = outer,
    public e,
    readonly f: Outer,
  ) {
    a;
  }
}

const unresovled = e;
