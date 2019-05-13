import rules from './rules';

import all from './configs/all.json';
import base from './configs/base.json';
import recommended from './configs/recommended.json';
import eslintRecommended from './configs/eslint-recommended';

export = {
  rules,
  configs: {
    all,
    base,
    recommended,
    'eslint-recommended': eslintRecommended,
  },
};
