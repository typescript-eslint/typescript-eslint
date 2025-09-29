// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { es2020 } from './es2020';
import { es2021_intl } from './es2021.intl';
import { es2021_promise } from './es2021.promise';
import { es2021_string } from './es2021.string';
import { es2021_weakref } from './es2021.weakref';

export const es2021: LibDefinition = {
  libs: [es2020, es2021_promise, es2021_string, es2021_weakref, es2021_intl],
  variables: [],
};
