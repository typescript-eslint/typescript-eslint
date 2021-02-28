//// @emitDecoratorMetadata = true

function deco(...param: any) {}

class T {}

class A {
  foo(a: T): T {}
  @deco
  foo1(a: T, b: T): T {}
}
