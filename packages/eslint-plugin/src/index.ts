import requireIndex from 'requireindex';
import path from 'path';

import recommended from './configs/recommended.json';
import eslintRecommended from './configs/eslint-recommended';

const rules = requireIndex(path.join(__dirname, 'rules'));
// eslint expects the rule to be on rules[name], not rules[name].default
const rulesWithoutDefault = Object.keys(rules).reduce<Record<string, any>>(
  (acc, ruleName) => {
    acc[ruleName] = rules[ruleName].default;
    return acc;
  },
  {},
);

// import all rules in lib/rules
export = {
  rules: rulesWithoutDefault,
  configs: {
    recommended,
    eslintRecommended,
  },
};
