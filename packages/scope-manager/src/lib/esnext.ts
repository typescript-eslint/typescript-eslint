// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { es2025 } from './es2025';
import { esnext_array } from './esnext.array';
import { esnext_collection } from './esnext.collection';
import { esnext_date } from './esnext.date';
import { esnext_decorators } from './esnext.decorators';
import { esnext_disposable } from './esnext.disposable';
import { esnext_error } from './esnext.error';
import { esnext_intl } from './esnext.intl';
import { esnext_sharedmemory } from './esnext.sharedmemory';
import { esnext_temporal } from './esnext.temporal';
import { esnext_typedarrays } from './esnext.typedarrays';

export const esnext: LibDefinition = {
  libs: [
    es2025,
    esnext_intl,
    esnext_collection,
    esnext_decorators,
    esnext_disposable,
    esnext_array,
    esnext_error,
    esnext_sharedmemory,
    esnext_typedarrays,
    esnext_temporal,
    esnext_date,
  ],
  variables: [],
};
