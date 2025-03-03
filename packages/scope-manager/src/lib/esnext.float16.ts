// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE, TYPE_VALUE } from './base-config';
import { es2015_iterable } from './es2015.iterable';
import { es2015_symbol } from './es2015.symbol';

export const esnext_float16: LibDefinition = {
  libs: [es2015_symbol, es2015_iterable],
  variables: [
    ['Float16Array', TYPE_VALUE],
    ['Float16ArrayConstructor', TYPE],
    ['Math', TYPE],
    ['DataView', TYPE],
  ],
};
