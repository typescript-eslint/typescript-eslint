// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';

import { TYPE } from './base-config';
import { es2021_promise } from './es2021.promise';

export const es2022_error = {
  ...es2021_promise,
  AggregateErrorConstructor: TYPE,
  Error: TYPE,
  ErrorConstructor: TYPE,
  ErrorOptions: TYPE,
  EvalErrorConstructor: TYPE,
  RangeErrorConstructor: TYPE,
  ReferenceErrorConstructor: TYPE,
  SyntaxErrorConstructor: TYPE,
  TypeErrorConstructor: TYPE,
  URIErrorConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
