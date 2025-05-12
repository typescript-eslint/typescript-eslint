import { RuleCreator } from '@typescript-eslint/rule-creator';

import type { ESLintPluginDocs } from '../../rules';

export const createRule = RuleCreator<ESLintPluginDocs>(
  name => `https://typescript-eslint.io/rules/${name}`,
);
