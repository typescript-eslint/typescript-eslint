// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE } from './base-config';
import { esnext_temporal } from './esnext.temporal';

export const esnext_date: LibDefinition = {
  libs: [esnext_temporal],
  variables: [['Date', TYPE]],
};
