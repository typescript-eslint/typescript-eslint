//// @emitDecoratorMetadata = true

function deco(...param: any) {}

class T {}
const keyName = 'foo';

class A {
  @deco
  set b(b: T) {}

  set ['a'](a: T) {}
  @deco
  get a() {}

  set [0](a: T) {}
  @deco
  get [0]() {}

  set [keyName](a: T) {}
  @deco
  get [keyName]() {}
}
