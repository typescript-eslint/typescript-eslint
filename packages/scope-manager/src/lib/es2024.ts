// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { es2023 } from './es2023';
import { es2024_arraybuffer } from './es2024.arraybuffer';
import { es2024_collection } from './es2024.collection';
import { es2024_object } from './es2024.object';
import { es2024_promise } from './es2024.promise';
import { es2024_regexp } from './es2024.regexp';
import { es2024_sharedmemory } from './es2024.sharedmemory';
import { es2024_string } from './es2024.string';

export const es2024: LibDefinition = {
  libs: [
    es2023,
    es2024_arraybuffer,
    es2024_collection,
    es2024_object,
    es2024_promise,
    es2024_regexp,
    es2024_sharedmemory,
    es2024_string,
  ],
  variables: [],
};
