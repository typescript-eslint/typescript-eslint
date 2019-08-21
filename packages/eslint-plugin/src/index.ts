import rules from './rules';

import all from './configs/all.json';
import base from './configs/base.json';
import recommended from './configs/recommended.json';
import recommendedRequiringTypeChecking from './configs/recommended-requiring-type-checking.json';
import eslintRecommended from './configs/eslint-recommended';

export = {
  rules,
  configs: {
    all,
    base,
    recommended,
    'eslint-recommended': eslintRecommended,
    'recommended-requiring-type-checking': recommendedRequiringTypeChecking,
  },
};
