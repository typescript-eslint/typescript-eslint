// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { TYPE } from './base-config';
import { es2020_intl } from './es2020.intl';

export const es2020_number = {
  ...es2020_intl,
  Number: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
