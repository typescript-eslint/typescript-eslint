// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { es2024 } from './es2024';
import { es2025_collection } from './es2025.collection';
import { es2025_float16 } from './es2025.float16';
import { es2025_intl } from './es2025.intl';
import { es2025_iterator } from './es2025.iterator';
import { es2025_promise } from './es2025.promise';
import { es2025_regexp } from './es2025.regexp';

export const es2025: LibDefinition = {
  libs: [
    es2024,
    es2025_collection,
    es2025_float16,
    es2025_intl,
    es2025_iterator,
    es2025_promise,
    es2025_regexp,
  ],
  variables: [],
};
