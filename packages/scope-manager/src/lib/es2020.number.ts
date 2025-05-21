// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE } from './base-config';
import { es2020_intl } from './es2020.intl';

export const es2020_number: LibDefinition = {
  libs: [es2020_intl],
  variables: [['Number', TYPE]],
};
