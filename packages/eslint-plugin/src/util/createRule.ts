import { ESLintUtils } from '@typescript-eslint/utils';

import type { ESLintPluginDocs } from '../../rules';

export const createRule = ESLintUtils.RuleCreator<ESLintPluginDocs>(
  name => `https://typescript-eslint.io/rules/${name}`,
);
