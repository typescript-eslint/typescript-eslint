import { ESLintUtils } from '@typescript-eslint/utils';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { version }: { version: string } = require('../../package.json');

export interface ESLintPluginInternalDocs {
  requiresTypeChecking?: true;
}

const createRule = ESLintUtils.RuleCreator<ESLintPluginInternalDocs>(
  name =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin-internal/src/rules/${name}.ts`,
);

export { createRule };
