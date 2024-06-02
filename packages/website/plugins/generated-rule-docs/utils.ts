import type {
  RuleMetaData,
  RuleMetaDataDocs,
  RuleModule,
} from '@typescript-eslint/utils/ts-eslint';
import * as fs from 'fs';
import * as lz from 'lz-string';
import type * as mdast from 'mdast';
import * as path from 'path';
import type * as unist from 'unist';
import type { VFile } from 'vfile';

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

export type RuleMetaDataWithDocs = RuleMetaData<string, readonly unknown[]> & {
  docs: RuleMetaDataDocs<readonly unknown[]>;
};

export type RuleModuleWithMetaDocs = RuleModule<string, unknown[]> & {
  meta: RuleMetaDataWithDocs;
};

export function isRuleModuleWithMetaDocs(
  rule: RuleModule<string, unknown[]> | undefined,
): rule is RuleModuleWithMetaDocs {
  return !!rule?.meta.docs;
}

export type VFileWithStem = VFile & {
  stem: string;
};

export function isVFileWithStem(file: VFile): file is VFileWithStem {
  return !!file.stem;
}

export function nodeIsCode(node: unist.Node): node is mdast.Code {
  return node.type === 'code';
}

export function nodeIsHeading(node: unist.Node): node is mdast.Heading {
  return node.type === 'heading';
}

export function nodeIsParent(node: unist.Node): node is unist.Parent {
  return 'children' in node;
}

export function findH2Index(
  children: unist.Node[],
  headingName: string,
): number {
  return children.findIndex(
    node =>
      nodeIsHeading(node) &&
      node.depth === 2 &&
      node.children.length === 1 &&
      node.children[0].type === 'text' &&
      node.children[0].value === headingName,
  );
}
