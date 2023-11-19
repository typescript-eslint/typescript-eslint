import prettier from '@prettier/sync';
import { compile } from '@typescript-eslint/rule-schema-to-typescript-types';
import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';
import type * as mdast from 'mdast';
import { EOL } from 'os';
import * as path from 'path';
import type * as unist from 'unist';

import { nodeIsHeading } from './nodes';
import type { RequiredHeadingIndices } from './requiredHeadings';
import { spliceChildrenAndAdjustHeadings } from './splicing';
import { convertToPlaygroundHash } from './strings';
import type { RuleMetaDataWithDocs, VFileWithStem } from './types';

/**
 * Rules whose options schema generate annoyingly complex schemas.
 *
 * @remarks These need to be typed in manually in their .md docs file.
 * @todo Get these schemas printing nicely in their .md docs files!
 */
const COMPLICATED_RULE_OPTIONS = new Set([
  'member-ordering',
  'naming-convention',
]);

/**
 * Rules that do funky things with their defaults and require special code
 * rather than just JSON.stringify-ing their defaults blob
 */
const SPECIAL_CASE_DEFAULTS = new Map([
  ['ban-types', '[{ /* See below for default options */ }]'],
]);

const prettierConfig = {
  ...(prettier.resolveConfig(__filename) ?? {}),
  filepath: path.join(__dirname, '../defaults.ts'),
};

export function spliceNewRuleReferences(
  children: unist.Node[],
  file: VFileWithStem,
  meta: RuleMetaDataWithDocs,
  headingIndices: RequiredHeadingIndices,
  rule: RuleModule<string, unknown[]>,
): string {
  // For non-extended rules, the code snippet is placed before the first h2
  // (i.e. at the end of the initial explanation)
  const firstH2Index = children.findIndex(
    child => nodeIsHeading(child) && child.depth === 2,
  );

  const eslintrc = `{
  "rules": {
    "@typescript-eslint/${file.stem}": "error"
  }
}`;

  spliceChildrenAndAdjustHeadings(
    children,
    headingIndices,
    firstH2Index,
    0,
    {
      lang: 'js',
      type: 'code',
      meta: 'title=".eslintrc.cjs"',
      value: `module.exports = ${eslintrc};`,
    } as mdast.Code,
    {
      value: `<try-in-playground eslintrcHash="${convertToPlaygroundHash(
        eslintrc,
      )}">Try this rule in the playground ↗</try-in-playground>`,
      type: 'jsx',
    } as unist.Node,
  );

  const hasNoConfig = Array.isArray(meta.schema)
    ? meta.schema.length === 0
    : Object.keys(meta.schema).length === 0;

  if (hasNoConfig) {
    spliceChildrenAndAdjustHeadings(
      children,
      headingIndices,
      headingIndices.howToUse + 1,
      0,
      {
        children: [
          {
            type: 'text',
            value: 'This rule is not configurable.',
          },
        ],
        type: 'paragraph',
      } as mdast.Paragraph,
    );
  } else if (!COMPLICATED_RULE_OPTIONS.has(file.stem)) {
    const defaults =
      SPECIAL_CASE_DEFAULTS.get(file.stem) ??
      JSON.stringify(rule.defaultOptions);

    spliceChildrenAndAdjustHeadings(
      children,
      headingIndices,
      headingIndices.options + 1,
      0,
      {
        children: [
          {
            type: 'text',
            value: 'This rule accepts the following options',
          } as mdast.Text,
        ],
        type: 'paragraph',
      } as mdast.Paragraph,
      {
        lang: 'ts',
        type: 'code',
        value: [
          compile(meta.schema),
          prettier.format(
            `const defaultOptions: Options = ${defaults};`,
            prettierConfig,
          ),
        ]
          .join(EOL)
          .trim(),
      } as mdast.Code,
    );
  }

  return eslintrc;
}
