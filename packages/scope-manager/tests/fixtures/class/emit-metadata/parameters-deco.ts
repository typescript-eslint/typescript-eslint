//// @emitDecoratorMetadata = true

function deco(...param: any) {}

class T {}

@deco
class A {
  constructor(@deco foo: T) {}

  set foo(@deco a: T) {}

  foo1(@deco a: T, b: T) {}
}
