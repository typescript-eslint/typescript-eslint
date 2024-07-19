import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import all from './configs/all';
import base from './configs/base';
import disableTypeChecked from './configs/disable-type-checked';
import eslintRecommended from './configs/eslint-recommended';
import recommended from './configs/recommended';
import recommendedTypeChecked from './configs/recommended-type-checked';
import recommendedTypeCheckedOnly from './configs/recommended-type-checked-only';
import strict from './configs/strict';
import strictTypeChecked from './configs/strict-type-checked';
import strictTypeCheckedOnly from './configs/strict-type-checked-only';
import stylistic from './configs/stylistic';
import stylisticTypeChecked from './configs/stylistic-type-checked';
import stylisticTypeCheckedOnly from './configs/stylistic-type-checked-only';
import rules from './rules';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const { name, version } = require('../package.json') as {
  name: string;
  version: string;
};

export = {
  configs: {
    all,
    base,
    'disable-type-checked': disableTypeChecked,
    'eslint-recommended': eslintRecommended,
    recommended,
    /** @deprecated - please use "recommended-type-checked" instead. */
    'recommended-requiring-type-checking': recommendedTypeChecked,
    'recommended-type-checked': recommendedTypeChecked,
    'recommended-type-checked-only': recommendedTypeCheckedOnly,
    strict,
    'strict-type-checked': strictTypeChecked,
    'strict-type-checked-only': strictTypeCheckedOnly,
    stylistic,
    'stylistic-type-checked': stylisticTypeChecked,
    'stylistic-type-checked-only': stylisticTypeCheckedOnly,
  },
  meta: {
    name,
    version,
  },
  rules,
} satisfies Linter.Plugin;
