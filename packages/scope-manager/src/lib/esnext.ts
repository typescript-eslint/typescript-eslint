// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { es2024 } from './es2024';
import { esnext_array } from './esnext.array';
import { esnext_collection } from './esnext.collection';
import { esnext_decorators } from './esnext.decorators';
import { esnext_disposable } from './esnext.disposable';
import { esnext_intl } from './esnext.intl';
import { esnext_iterator } from './esnext.iterator';

export const esnext: LibDefinition = {
  libs: [
    es2024,
    esnext_intl,
    esnext_decorators,
    esnext_disposable,
    esnext_collection,
    esnext_array,
    esnext_iterator,
  ],
  variables: [],
};
