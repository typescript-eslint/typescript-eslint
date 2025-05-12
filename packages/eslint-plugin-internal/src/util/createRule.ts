import { RuleCreator } from '@typescript-eslint/rule-creator';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { version }: { version: string } = require('../../package.json');

export interface ESLintPluginInternalDocs {
  requiresTypeChecking?: true;
}

export const createRule = RuleCreator<ESLintPluginInternalDocs>(
  name =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin-internal/src/rules/${name}.ts`,
);
