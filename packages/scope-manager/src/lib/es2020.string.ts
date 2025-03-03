// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE } from './base-config';
import { es2015_iterable } from './es2015.iterable';
import { es2020_intl } from './es2020.intl';
import { es2020_symbol_wellknown } from './es2020.symbol.wellknown';

export const es2020_string: LibDefinition = {
  libs: [es2015_iterable, es2020_intl, es2020_symbol_wellknown],
  variables: [['String', TYPE]],
};
