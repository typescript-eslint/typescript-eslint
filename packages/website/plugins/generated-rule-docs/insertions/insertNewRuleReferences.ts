import { compile } from '@typescript-eslint/rule-schema-to-typescript-types';
import type * as mdast from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx';
import { EOL } from 'os';
import * as path from 'path';
import prettier from 'prettier';

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

const PRETTIER_CONFIG_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  '.prettierrc.json',
);
const prettierConfig = (async () => {
  const filepath = path.join(__dirname, 'file.ts');
  const config = await prettier.resolveConfig(filepath, {
    config: PRETTIER_CONFIG_PATH,
  });
  if (config == null) {
    throw new Error('Unable to resolve prettier config');
  }
  return {
    ...config,
    filepath,
  };
})();

export async function insertNewRuleReferences(
  page: RuleDocsPage,
): Promise<string> {
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
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'eslintrcHash',
          value: convertToPlaygroundHash(eslintrc),
        },
      ],
      children: [
        {
          children: [
            {
              value: 'Try this rule in the playground ↗',
              type: 'text',
            },
          ],
          type: 'paragraph',
        },
      ],
      name: 'TryInPlayground',
      type: 'mdxJsxFlowElement',
    } as MdxJsxFlowElement,
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
    page.spliceChildren(
      page.headingIndices.options + 1,
      0,
      {
        children:
          typeof page.rule.meta.docs.recommended === 'object'
            ? [
                {
                  type: 'text',
                  value:
                    'This rule accepts the following options, and has more strict settings in the ',
                } as mdast.Text,
                ...linkToConfigs(
                  page.rule.meta.docs.requiresTypeChecking
                    ? ['strict', 'strict-type-checked']
                    : ['strict'],
                ),
                {
                  type: 'text',
                  value: ` config${page.rule.meta.docs.requiresTypeChecking ? 's' : ''}.`,
                } as mdast.Text,
              ]
            : [
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
          await compile(page.rule.meta.schema, prettierConfig),
          await prettier.format(
            getRuleDefaultOptions(page),
            await prettierConfig,
          ),
        ]
          .join(EOL)
          .trim(),
      } as mdast.Code,
    );
  }

  return eslintrc;
}

function linkToConfigs(configs: string[]): mdast.Node[] {
  const links = configs.map(
    (config): mdast.Link => ({
      children: [
        {
          type: 'inlineCode',
          value: config,
        } as mdast.InlineCode,
      ],
      type: 'link',
      url: `/users/configs#${config})`,
    }),
  );

  return links.length === 1
    ? links
    : [
        links[0],
        {
          type: 'text',
          value: ' and ',
        } as mdast.Text,
        links[1],
      ];
}

function getRuleDefaultOptions(page: RuleDocsPage): string {
  const defaults =
    SPECIAL_CASE_DEFAULTS.get(page.file.stem) ??
    JSON.stringify(page.rule.defaultOptions);

  const recommended = page.rule.meta.docs.recommended;

  return typeof recommended === 'object'
    ? [
        `const defaultOptionsRecommended: Options = ${defaults};`,
        `const defaultOptionsStrict: Options = ${JSON.stringify(recommended.strict)};`,
      ].join('\n\n')
    : `const defaultOptions: Options = ${defaults};`;
}
