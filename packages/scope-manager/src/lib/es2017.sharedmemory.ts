// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE, TYPE_VALUE } from './base-config';
import { es2015_symbol } from './es2015.symbol';
import { es2015_symbol_wellknown } from './es2015.symbol.wellknown';

export const es2017_sharedmemory: LibDefinition = {
  libs: [es2015_symbol, es2015_symbol_wellknown],
  variables: [
    ['SharedArrayBuffer', TYPE_VALUE],
    ['SharedArrayBufferConstructor', TYPE],
    ['ArrayBufferTypes', TYPE],
    ['Atomics', TYPE_VALUE],
  ],
};
