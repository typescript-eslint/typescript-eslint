import * as fs from 'fs';
import * as lz from 'lz-string';
import * as path from 'path';

export const eslintPluginDirectory = path.resolve(
  path.join(__dirname, '../../../eslint-plugin'),
);

export const sourceUrlPrefix =
  'https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/';

/**
 * @param withComment Whether to include a full comment note.
 * @remarks `withComment` can't be used inside a JSON object which is needed for eslintrc in the playground
 */
export function getEslintrcString(
  extendsBaseRuleName: string,
  stem: string,
  withComment: boolean,
): string {
  return `{
"rules": {${
    withComment
      ? '\n    // Note: you must disable the base rule as it can report incorrect errors'
      : ''
  }
"${extendsBaseRuleName}": "off",
"@typescript-eslint/${stem}": "error"
}
}`;
}

export function convertToPlaygroundHash(eslintrc: string): string {
  return lz.compressToEncodedURIComponent(eslintrc);
}

export function getUrlForRuleTest(ruleName: string): string {
  for (const localPath of [
    `tests/rules/${ruleName}.test.ts`,
    `tests/rules/${ruleName}/`,
  ]) {
    if (fs.existsSync(`${eslintPluginDirectory}/${localPath}`)) {
      return `${sourceUrlPrefix}${localPath}`;
    }
  }

  throw new Error(`Could not find test file for ${ruleName}.`);
}
