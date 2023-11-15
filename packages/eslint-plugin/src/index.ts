import all from './configs/all';
import base from './configs/base';
import disableTypeChecked from './configs/disable-type-checked';
import eslintRecommended from './configs/eslint-recommended';
import recommended from './configs/recommended';
import recommendedTypeChecked from './configs/recommended-type-checked';
import strict from './configs/strict';
import strictTypeChecked from './configs/strict-type-checked';
import stylistic from './configs/stylistic';
import stylisticTypeChecked from './configs/stylistic-type-checked';
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
    strict,
    'strict-type-checked': strictTypeChecked,
    stylistic,
    'stylistic-type-checked': stylisticTypeChecked,
  },
  meta: {
    name,
    version,
  },
  rules,
};
