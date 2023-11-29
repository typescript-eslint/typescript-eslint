import prettier from '@prettier/sync';
import { compile } from '@typescript-eslint/rule-schema-to-typescript-types';
import type * as mdast from 'mdast';
import { EOL } from 'os';
import * as path from 'path';
import type * as unist from 'unist';

import type { RuleDocsPage } from '../RuleDocsPage';
import { convertToPlaygroundHash, nodeIsHeading } from '../utils';

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

export function insertNewRuleReferences(page: RuleDocsPage): string {
  // For non-extended rules, the code snippet is placed before the first h2
  // (i.e. at the end of the initial explanation)
  const firstH2Index = page.children.findIndex(
    child => nodeIsHeading(child) && child.depth === 2,
  );

  const eslintrc = `{
  "rules": {
    "@typescript-eslint/${page.file.stem}": "error"
  }
}`;

  page.spliceChildren(
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

  const hasNoConfig = Array.isArray(page.rule.meta.schema)
    ? page.rule.meta.schema.length === 0
    : Object.keys(page.rule.meta.schema).length === 0;

  if (hasNoConfig) {
    page.spliceChildren(page.headingIndices.options + 1, 0, {
      children: [
        {
          type: 'text',
          value: 'This rule is not configurable.',
        },
      ],
      type: 'paragraph',
    } as mdast.Paragraph);
  } else if (!COMPLICATED_RULE_OPTIONS.has(page.file.stem)) {
    const defaults =
      SPECIAL_CASE_DEFAULTS.get(page.file.stem) ??
      JSON.stringify(page.rule.defaultOptions);

    page.spliceChildren(
      page.headingIndices.options + 1,
      0,
      {
        children: [
          {
            type: 'text',
            value: 'This rule accepts the following options:',
          } as mdast.Text,
        ],
        type: 'paragraph',
      } as mdast.Paragraph,
      {
        lang: 'ts',
        type: 'code',
        value: [
          compile(page.rule.meta.schema),
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
