// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { TYPE } from './base-config';
import { es2018_asynciterable } from './es2018.asynciterable';

export const es2018_asyncgenerator = {
  ...es2018_asynciterable,
  AsyncGenerator: TYPE,
  AsyncGeneratorFunction: TYPE,
  AsyncGeneratorFunctionConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
