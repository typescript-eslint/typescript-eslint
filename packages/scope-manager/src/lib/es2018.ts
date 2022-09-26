// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { es2017 } from './es2017';
import { es2018_asyncgenerator } from './es2018.asyncgenerator';
import { es2018_asynciterable } from './es2018.asynciterable';
import { es2018_intl } from './es2018.intl';
import { es2018_promise } from './es2018.promise';
import { es2018_regexp } from './es2018.regexp';

export const es2018 = {
  ...es2017,
  ...es2018_asynciterable,
  ...es2018_asyncgenerator,
  ...es2018_promise,
  ...es2018_regexp,
  ...es2018_intl,
} as Record<string, ImplicitLibVariableOptions>;
