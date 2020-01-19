import { ESLintUtils } from '@typescript-eslint/experimental-utils';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const version = require('../../package.json').version;

export const createRule = ESLintUtils.RuleCreator(
  name =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin/docs/rules/${name}.md`,
);
