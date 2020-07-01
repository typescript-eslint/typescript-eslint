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
    writeable: false,
  },
  SharedArrayBufferConstructor: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: false,
    name: 'SharedArrayBufferConstructor',
    writeable: false,
  },
  ArrayBufferTypes: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: false,
    name: 'ArrayBufferTypes',
    writeable: false,
  },
  Atomics: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: true,
    name: 'Atomics',
    writeable: false,
  },
} as Record<string, ImplicitLibVariableOptions>;
