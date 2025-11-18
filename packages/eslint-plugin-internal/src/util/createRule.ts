import { ESLintUtils } from '@typescript-eslint/utils';

export interface ESLintPluginInternalDocs {
  requiresTypeChecking?: true;
}

export const createRule = ESLintUtils.RuleCreator<ESLintPluginInternalDocs>(
  name =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin-internal/src/rules/${name}.ts`,
);
