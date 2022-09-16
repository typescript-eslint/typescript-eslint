// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { es2015_symbol } from './es2015.symbol';
import { TYPE } from './base-config';

export const es2015_symbol_wellknown = {
  ...es2015_symbol,
  SymbolConstructor: TYPE,
  Symbol: TYPE,
  Array: TYPE,
  Date: TYPE,
  Map: TYPE,
  WeakMap: TYPE,
  Set: TYPE,
  WeakSet: TYPE,
  JSON: TYPE,
  Function: TYPE,
  GeneratorFunction: TYPE,
  Math: TYPE,
  Promise: TYPE,
  PromiseConstructor: TYPE,
  RegExp: TYPE,
  RegExpConstructor: TYPE,
  String: TYPE,
  ArrayBuffer: TYPE,
  DataView: TYPE,
  Int8Array: TYPE,
  Uint8Array: TYPE,
  Uint8ClampedArray: TYPE,
  Int16Array: TYPE,
  Uint16Array: TYPE,
  Int32Array: TYPE,
  Uint32Array: TYPE,
  Float32Array: TYPE,
  Float64Array: TYPE,
  ArrayConstructor: TYPE,
  MapConstructor: TYPE,
  SetConstructor: TYPE,
  ArrayBufferConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
