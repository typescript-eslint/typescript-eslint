class D extends DecoratorProvider {
  m() {
    class C {
      @(super.decorate) // note the parentheses
      method2() {}
    }
  }
}
