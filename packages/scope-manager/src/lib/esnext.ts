// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/repo-tools

import type { ImplicitLibVariableOptions } from '../variable';
import { es2023 } from './es2023';
import { esnext_decorators } from './esnext.decorators';
import { esnext_disposable } from './esnext.disposable';
import { esnext_intl } from './esnext.intl';

export const esnext = {
  ...es2023,
  ...esnext_intl,
  ...esnext_decorators,
  ...esnext_disposable,
} as Record<string, ImplicitLibVariableOptions>;
