// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import { ImplicitLibVariableOptions } from '../variable';
import { es2022 } from './es2022';
import { esnext_intl } from './esnext.intl';

export const esnext = {
  ...es2022,
  ...esnext_intl,
} as Record<string, ImplicitLibVariableOptions>;
