//// @emitDecoratorMetadata = true

import { TestGeneric, Test } from 'fake-module';

declare function deco(..._param: any): any;
export class TestClass {
  @deco
  public test(): TestGeneric<Test> {}
}
