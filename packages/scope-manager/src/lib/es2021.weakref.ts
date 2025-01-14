// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE, TYPE_VALUE } from './base-config';
import { es2015_symbol_wellknown } from './es2015.symbol.wellknown';

export const es2021_weakref: LibDefinition = {
  libs: [es2015_symbol_wellknown],
  variables: [
    ['WeakRef', TYPE_VALUE],
    ['WeakRefConstructor', TYPE],
    ['FinalizationRegistry', TYPE_VALUE],
    ['FinalizationRegistryConstructor', TYPE],
  ],
};
