//// @emitDecoratorMetadata = true

function deco(...param: any) {}

@deco
class A {
  property: Type1;
  @deco
  propertyWithDeco: a.Foo;

  set foo(@deco a: SetterType) {}

  constructor(foo: b.Foo) {}

  foo1(@deco a: Type2, b: Type0) {}

  @deco
  foo2(a: Type3) {}

  @deco
  foo3(): Type4 {}

  set ['a'](a: Type5) {}
  set [0](a: Type6) {}
  @deco
  get a() {}
  @deco
  get [0]() {}
}

const keyName = 'foo';
class B {
  constructor(@deco foo: c.Foo) {}

  set [keyName](a: Type) {}
  @deco
  get [keyName]() {}
}
