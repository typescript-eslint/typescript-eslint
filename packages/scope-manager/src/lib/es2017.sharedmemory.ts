// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING yarn generate:lib

import { ImplicitLibVariableOptions } from '../variable';
import { es2015_symbol } from './es2015.symbol';
import { es2015_symbol_wellknown } from './es2015.symbol.wellknown';

export const es2017_sharedmemory = {
  ...es2015_symbol,
  ...es2015_symbol_wellknown,
  SharedArrayBuffer: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: true,
    name: 'SharedArrayBuffer',
  },
  SharedArrayBufferConstructor: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: false,
    name: 'SharedArrayBufferConstructor',
  },
  ArrayBufferTypes: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: false,
    name: 'ArrayBufferTypes',
  },
  Atomics: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: true,
    name: 'Atomics',
  },
} as Record<string, ImplicitLibVariableOptions>;
