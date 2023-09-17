// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/repo-tools

import type { ImplicitLibVariableOptions } from '../variable';
import { es2022 } from './es2022';
import { es2023_array } from './es2023.array';
import { es2023_collection } from './es2023.collection';

export const es2023 = {
  ...es2022,
  ...es2023_array,
  ...es2023_collection,
} as Record<string, ImplicitLibVariableOptions>;
