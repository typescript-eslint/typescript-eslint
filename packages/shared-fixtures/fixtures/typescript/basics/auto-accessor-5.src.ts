class C1 {
  accessor ["w"]: any;
  accessor ["x"] = 1;
  static accessor ["y"]: any;
  static accessor ["z"] = 2;
}

declare var f: any;
class C2 {
  accessor [f()] = 1;
}
