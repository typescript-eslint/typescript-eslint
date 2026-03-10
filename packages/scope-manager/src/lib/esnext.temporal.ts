// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { TYPE_VALUE } from './base-config';
import { es2015_symbol_wellknown } from './es2015.symbol.wellknown';
import { es2020_intl } from './es2020.intl';
import { es2025_intl } from './es2025.intl';

export const esnext_temporal: LibDefinition = {
  libs: [es2015_symbol_wellknown, es2020_intl, es2025_intl],
  variables: [['Temporal', TYPE_VALUE]],
};
