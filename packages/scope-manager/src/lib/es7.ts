// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import { ImplicitLibVariableOptions } from '../variable';
import { es2015 } from './es2015';
import { es2016_array_include } from './es2016.array.include';

export const es7 = {
  ...es2015,
  ...es2016_array_include,
} as Record<string, ImplicitLibVariableOptions>;
