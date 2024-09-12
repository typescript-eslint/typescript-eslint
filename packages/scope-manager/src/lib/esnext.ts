// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';
import { es2023 } from './es2023';
import { esnext_array } from './esnext.array';
import { esnext_collection } from './esnext.collection';
import { esnext_decorators } from './esnext.decorators';
import { esnext_disposable } from './esnext.disposable';
import { esnext_intl } from './esnext.intl';
import { esnext_iterator } from './esnext.iterator';
import { esnext_object } from './esnext.object';
import { esnext_promise } from './esnext.promise';
import { esnext_regexp } from './esnext.regexp';
import { esnext_string } from './esnext.string';

export const esnext = {
  ...es2023,
  ...esnext_intl,
  ...esnext_decorators,
  ...esnext_disposable,
  ...esnext_promise,
  ...esnext_object,
  ...esnext_collection,
  ...esnext_array,
  ...esnext_regexp,
  ...esnext_string,
  ...esnext_iterator,
} as Record<string, ImplicitLibVariableOptions>;
