import { RuleCreator } from '@typescript-eslint/utils/eslint-utils';

export const createRule = RuleCreator(
  name => `https://typescript-eslint.io/rules/${name}`,
);
