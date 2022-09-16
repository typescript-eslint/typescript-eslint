// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { TYPE } from './base-config';
import { es2015_iterable } from './es2015.iterable';
import { es2015_symbol } from './es2015.symbol';

export const es2018_asynciterable = {
  ...es2015_symbol,
  ...es2015_iterable,
  SymbolConstructor: TYPE,
  AsyncIterator: TYPE,
  AsyncIterable: TYPE,
  AsyncIterableIterator: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
