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

export = {
  configs: {
    all,
    base,
    'disable-type-checked': disableTypeChecked,
    'eslint-recommended': eslintRecommended,
    recommended,
    'recommended-requiring-type-checking': recommendedTypeChecked,
    'recommended-type-checked': recommendedTypeChecked,
    strict,
    'strict-type-checked': strictTypeChecked,
    stylistic,
    'stylistic-type-checked': stylisticTypeChecked,
  },
  rules,
};
