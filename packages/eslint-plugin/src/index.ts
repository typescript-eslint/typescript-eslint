import all from './configs/all';
import base from './configs/base';
import eslintRecommended from './configs/eslint-recommended';
import recommended from './configs/recommended';
import recommendedRequiringTypeChecking from './configs/recommended-type-checked';
import strict from './configs/strict';
import rules from './rules';

export = {
  rules,
  configs: {
    all,
    base,
    recommended,
    'eslint-recommended': eslintRecommended,
    'recommended-type-checked': recommendedRequiringTypeChecking,
    strict,
  },
};
