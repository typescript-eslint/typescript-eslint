// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import { ImplicitLibVariableOptions } from '../variable';
import { es2015_symbol } from './es2015.symbol';
import { es2015_symbol_wellknown } from './es2015.symbol.wellknown';
import { TYPE_VALUE, TYPE } from './base-config';

export const es2017_sharedmemory = {
  ...es2015_symbol,
  ...es2015_symbol_wellknown,
  SharedArrayBuffer: TYPE_VALUE,
  SharedArrayBufferConstructor: TYPE,
  ArrayBufferTypes: TYPE,
  Atomics: TYPE_VALUE,
} as Record<string, ImplicitLibVariableOptions>;
