class D extends DecoratorProvider {
  m() {
    class C {
      @(super.decorate) // note the lack of parentheses
      method2() {}
    }
  }
}
