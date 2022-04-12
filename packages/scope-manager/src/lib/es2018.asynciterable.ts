// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import { ImplicitLibVariableOptions } from '../variable';
import { es2015_symbol } from './es2015.symbol';
import { es2015_iterable } from './es2015.iterable';
import { TYPE } from './base-config';

export const es2018_asynciterable = {
  ...es2015_symbol,
  ...es2015_iterable,
  SymbolConstructor: TYPE,
  AsyncIterator: TYPE,
  AsyncIterable: TYPE,
  AsyncIterableIterator: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
