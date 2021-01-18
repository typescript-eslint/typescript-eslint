//// @emitDecoratorMetadata = true

function deco(...param: any) {}

class T {}

@deco
class A {
  constructor(foo: T) {
    class B {
      constructor(bar: T) {}
    }
  }
}
