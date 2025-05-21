// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { es2015 } from './es2015';
import { es2016_array_include } from './es2016.array.include';
import { es2016_intl } from './es2016.intl';

export const es2016: LibDefinition = {
  libs: [es2015, es2016_array_include, es2016_intl],
  variables: [],
};
