// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { es2023 } from './es2023';
import { esnext_intl } from './esnext.intl';

export const esnext = {
  ...es2023,
  ...esnext_intl,
} as Record<string, ImplicitLibVariableOptions>;
