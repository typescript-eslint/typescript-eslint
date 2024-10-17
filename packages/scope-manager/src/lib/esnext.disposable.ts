// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';

import { TYPE, TYPE_VALUE } from './base-config';
import { es2015_symbol } from './es2015.symbol';

export const esnext_disposable = {
  ...es2015_symbol,
  AsyncDisposable: TYPE,
  AsyncDisposableStack: TYPE_VALUE,
  AsyncDisposableStackConstructor: TYPE,
  Disposable: TYPE,
  DisposableStack: TYPE_VALUE,
  DisposableStackConstructor: TYPE,
  SuppressedError: TYPE_VALUE,
  SuppressedErrorConstructor: TYPE,
  SymbolConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
