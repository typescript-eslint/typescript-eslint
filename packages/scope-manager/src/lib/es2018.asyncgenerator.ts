// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE } from './base-config';
import { es2018_asynciterable } from './es2018.asynciterable';

export const es2018_asyncgenerator: LibDefinition = {
  libs: [es2018_asynciterable],
  variables: [
    ['AsyncGenerator', TYPE],
    ['AsyncGeneratorFunction', TYPE],
    ['AsyncGeneratorFunctionConstructor', TYPE],
  ],
};
