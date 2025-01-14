// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE } from './base-config';
import { es2024_collection } from './es2024.collection';

export const esnext_collection: LibDefinition = {
  libs: [es2024_collection],
  variables: [
    ['ReadonlySetLike', TYPE],
    ['Set', TYPE],
    ['ReadonlySet', TYPE],
  ],
};
