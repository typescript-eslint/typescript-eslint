// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING yarn generate:lib

import { ImplicitLibVariableOptions } from '../variable';
import { es2015_iterable } from './es2015.iterable';
import { es2015_symbol } from './es2015.symbol';

export const es2020_symbol_wellknown = {
  ...es2015_iterable,
  ...es2015_symbol,
  SymbolConstructor: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: false,
    name: 'SymbolConstructor',
  },
  RegExp: {
    eslintImplicitGlobalSetting: 'readonly',
    isTypeVariable: true,
    isValueVariable: false,
    name: 'RegExp',
  },
} as Record<string, ImplicitLibVariableOptions>;
