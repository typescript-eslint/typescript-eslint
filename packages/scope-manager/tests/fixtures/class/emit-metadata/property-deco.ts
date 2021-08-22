//// @emitDecoratorMetadata = true

function deco(...param: any) {}

namespace a {
  export class B {}
}

class A {
  property: a.B;
  @deco
  propertyWithDeco: a.B;
}
