import { ESLintUtils } from '@typescript-eslint/utils';

import packageJson from './packagejson.js';

const { version } = packageJson;

export interface ESLintPluginInternalDocs {
  requiresTypeChecking?: true;
}

export const createRule = ESLintUtils.RuleCreator<ESLintPluginInternalDocs>(
  name =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin-internal/src/rules/${name}.ts`,
);
