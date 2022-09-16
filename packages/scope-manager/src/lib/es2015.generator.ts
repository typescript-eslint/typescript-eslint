// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { TYPE } from './base-config';
import { es2015_iterable } from './es2015.iterable';

export const es2015_generator = {
  ...es2015_iterable,
  Generator: TYPE,
  GeneratorFunction: TYPE,
  GeneratorFunctionConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
