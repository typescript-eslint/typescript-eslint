import all from './configs/all';
import base from './configs/base';
import eslintRecommended from './configs/eslint-recommended';
import recommended from './configs/recommended';
import recommendedRequiringTypeChecking from './configs/recommended-requiring-type-checking';
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
    'eslint-recommended': eslintRecommended,
    recommended,
    'recommended-requiring-type-checking': recommendedRequiringTypeChecking,
    'recommended-type-checked': recommendedTypeChecked,
    strict,
    'strict-type-checked': strictTypeChecked,
    stylistic,
    'stylistic-type-checked': stylisticTypeChecked,
  },
  rules,
};
