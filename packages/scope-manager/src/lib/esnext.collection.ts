// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';

import { TYPE } from './base-config';
import { es2024_collection } from './es2024.collection';

export const esnext_collection = {
  ...es2024_collection,
  ReadonlySet: TYPE,
  ReadonlySetLike: TYPE,
  Set: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
