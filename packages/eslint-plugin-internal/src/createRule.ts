import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';

const createRule = ESLintUtils.RuleCreator(() => '');

function fileIsInFolderWhitelist(
  context: TSESLint.RuleContext<never, never[]>,
  folderWhitelist: readonly string[],
): boolean {
  const filename = context.getFilename();

  for (const folder of folderWhitelist) {
    if (filename.includes(folder)) {
      return true;
    }
  }

  return false;
}

export { createRule, fileIsInFolderWhitelist };
