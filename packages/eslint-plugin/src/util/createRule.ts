import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export const createRule = ESLintUtils.RuleCreator(
  name => `https://typescript-eslint.io/rules/${name}`,
);
