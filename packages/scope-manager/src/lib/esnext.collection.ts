// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE } from './base-config';
import { es2025_collection } from './es2025.collection';

export const esnext_collection: LibDefinition = {
  libs: [es2025_collection],
  variables: [
    ['Map', TYPE],
    ['WeakMap', TYPE],
  ],
};
