// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE } from './base-config';
import { es2021_promise } from './es2021.promise';

export const es2022_error: LibDefinition = {
  libs: [es2021_promise],
  variables: [
    ['ErrorOptions', TYPE],
    ['Error', TYPE],
    ['ErrorConstructor', TYPE],
    ['EvalErrorConstructor', TYPE],
    ['RangeErrorConstructor', TYPE],
    ['ReferenceErrorConstructor', TYPE],
    ['SyntaxErrorConstructor', TYPE],
    ['TypeErrorConstructor', TYPE],
    ['URIErrorConstructor', TYPE],
    ['AggregateErrorConstructor', TYPE],
  ],
};
