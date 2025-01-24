// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';

import { TYPE, TYPE_VALUE } from './base-config';
import { es2015_symbol_wellknown } from './es2015.symbol.wellknown';

export const esnext_weakref = {
  ...es2015_symbol_wellknown,
  FinalizationRegistry: TYPE_VALUE,
  FinalizationRegistryConstructor: TYPE,
  WeakRef: TYPE_VALUE,
  WeakRefConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
