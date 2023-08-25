// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import { ImplicitLibVariableOptions } from '../variable';
import { decorators } from './decorators';
import { decorators_legacy } from './decorators.legacy';
import { TYPE, TYPE_VALUE } from './base-config';

export const es5 = {
  ...decorators,
  ...decorators_legacy,
  Symbol: TYPE,
  PropertyKey: TYPE,
  PropertyDescriptor: TYPE,
  PropertyDescriptorMap: TYPE,
  Object: TYPE_VALUE,
  ObjectConstructor: TYPE,
  Function: TYPE_VALUE,
  FunctionConstructor: TYPE,
  ThisParameterType: TYPE,
  OmitThisParameter: TYPE,
  CallableFunction: TYPE,
  NewableFunction: TYPE,
  IArguments: TYPE,
  String: TYPE_VALUE,
  StringConstructor: TYPE,
  Boolean: TYPE_VALUE,
  BooleanConstructor: TYPE,
  Number: TYPE_VALUE,
  NumberConstructor: TYPE,
  TemplateStringsArray: TYPE,
  ImportMeta: TYPE,
  ImportCallOptions: TYPE,
  ImportAssertions: TYPE,
  Math: TYPE_VALUE,
  Date: TYPE_VALUE,
  DateConstructor: TYPE,
  RegExpMatchArray: TYPE,
  RegExpExecArray: TYPE,
  RegExp: TYPE_VALUE,
  RegExpConstructor: TYPE,
  Error: TYPE_VALUE,
  ErrorConstructor: TYPE,
  EvalError: TYPE_VALUE,
  EvalErrorConstructor: TYPE,
  RangeError: TYPE_VALUE,
  RangeErrorConstructor: TYPE,
  ReferenceError: TYPE_VALUE,
  ReferenceErrorConstructor: TYPE,
  SyntaxError: TYPE_VALUE,
  SyntaxErrorConstructor: TYPE,
  TypeError: TYPE_VALUE,
  TypeErrorConstructor: TYPE,
  URIError: TYPE_VALUE,
  URIErrorConstructor: TYPE,
  JSON: TYPE_VALUE,
  ReadonlyArray: TYPE,
  ConcatArray: TYPE,
  Array: TYPE_VALUE,
  ArrayConstructor: TYPE,
  TypedPropertyDescriptor: TYPE,
  PromiseConstructorLike: TYPE,
  PromiseLike: TYPE,
  Promise: TYPE,
  Awaited: TYPE,
  ArrayLike: TYPE,
  Partial: TYPE,
  Required: TYPE,
  Readonly: TYPE,
  Pick: TYPE,
  Record: TYPE,
  Exclude: TYPE,
  Extract: TYPE,
  Omit: TYPE,
  NonNullable: TYPE,
  Parameters: TYPE,
  ConstructorParameters: TYPE,
  ReturnType: TYPE,
  InstanceType: TYPE,
  Uppercase: TYPE,
  Lowercase: TYPE,
  Capitalize: TYPE,
  Uncapitalize: TYPE,
  ThisType: TYPE,
  WeakKeyTypes: TYPE,
  WeakKey: TYPE,
  ArrayBuffer: TYPE_VALUE,
  ArrayBufferTypes: TYPE,
  ArrayBufferLike: TYPE,
  ArrayBufferConstructor: TYPE,
  ArrayBufferView: TYPE,
  DataView: TYPE_VALUE,
  DataViewConstructor: TYPE,
  Int8Array: TYPE_VALUE,
  Int8ArrayConstructor: TYPE,
  Uint8Array: TYPE_VALUE,
  Uint8ArrayConstructor: TYPE,
  Uint8ClampedArray: TYPE_VALUE,
  Uint8ClampedArrayConstructor: TYPE,
  Int16Array: TYPE_VALUE,
  Int16ArrayConstructor: TYPE,
  Uint16Array: TYPE_VALUE,
  Uint16ArrayConstructor: TYPE,
  Int32Array: TYPE_VALUE,
  Int32ArrayConstructor: TYPE,
  Uint32Array: TYPE_VALUE,
  Uint32ArrayConstructor: TYPE,
  Float32Array: TYPE_VALUE,
  Float32ArrayConstructor: TYPE,
  Float64Array: TYPE_VALUE,
  Float64ArrayConstructor: TYPE,
  Intl: TYPE_VALUE,
} as Record<string, ImplicitLibVariableOptions>;
