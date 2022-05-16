import rules from './rules';

import all from './configs/all';
import base from './configs/base';
import eslintRecommended from './configs/eslint-recommended';
import recommended from './configs/recommended';
import recommendedRequiringTypeChecking from './configs/recommended-requiring-type-checking';
import strict from './configs/strict';

export = {
  rules,
  configs: {
    all,
    base,
    recommended,
    'eslint-recommended': eslintRecommended,
    'recommended-requiring-type-checking': recommendedRequiringTypeChecking,
    strict,
  },
};
