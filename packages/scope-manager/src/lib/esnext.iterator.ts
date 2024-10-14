// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';
import { es2015_iterable } from './es2015.iterable';
import { TYPE, TYPE_VALUE } from './base-config';

export const esnext_iterator = {
  ...es2015_iterable,
  Iterator: TYPE_VALUE,
  IteratorObjectConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
