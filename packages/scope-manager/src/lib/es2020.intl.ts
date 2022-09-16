// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { TYPE_VALUE } from './base-config';
import { es2018_intl } from './es2018.intl';

export const es2020_intl = {
  ...es2018_intl,
  Intl: TYPE_VALUE,
} as Record<string, ImplicitLibVariableOptions>;
