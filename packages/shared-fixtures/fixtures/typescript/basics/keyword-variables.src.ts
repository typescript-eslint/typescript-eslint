{
  const abstract = 1;
  const as = 1;
  const asserts = 1;
  const any = 1;
  const async = 1;
  const await = 1;
  const boolean = 1;
  const constructor = 1;
  const declare = 1;
  const get = 1;
  const infer = 1;
  const is = 1;
  const keyof = 1;
  const module = 1;
  const namespace = 1;
  const never = 1;
  const readonly = 1;
  const require = 1;
  const number = 1;
  const object = 1;
  const set = 1;
  const string = 1;
  const symbol = 1;
  const type = 1;
  const undefined = 1;
  const unique = 1;
  const unknown = 1;
  const from = 1;
  const global = 1;
  const bigint = 1;
  const of = 1;
}

import {
  abstract,
  as,
  asserts,
  any,
  async,
  await,
  boolean,
  constructor,
  declare,
  get,
  infer,
  is,
  keyof,
  module,
  namespace,
  never,
  readonly,
  require,
  number,
  object,
  set,
  string,
  symbol,
  type,
  undefined,
  unique,
  unknown,
  from,
  global,
  bigint,
  of,
} from 'fake-module';

interface X {}
class C implements X {
  static a() {}
  private b() {}
  public c() {}
  protected *d() {
    let x = yield;
  }
}
