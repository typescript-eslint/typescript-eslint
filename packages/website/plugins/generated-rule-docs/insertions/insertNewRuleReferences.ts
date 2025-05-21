import type { ESLintPluginDocs } from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type * as mdast from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import { compile } from '@typescript-eslint/rule-schema-to-typescript-types';
import { EOL } from 'node:os';
import * as path from 'node:path';
import prettier from 'prettier';

import type { RuleDocsPage } from '../RuleDocsPage';

import { nodeIsHeading } from '../../utils/nodes';
import { convertToPlaygroundHash } from '../../utils/rules';

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

  const rules = `{
    "@typescript-eslint/${page.file.stem}": "error"
  }`;

  const eslintrc = `{
  "rules": ${rules}
}`;

  const eslintConfig = `{
  rules: ${rules}
}`;

  page.spliceChildren(
    firstH2Index,
    0,
    {
      children: [
        {
          attributes: [
            {
              name: 'value',
              type: 'mdxJsxAttribute',
              value: 'Flat Config',
            },
          ],
          children: [
            {
              lang: 'js',
              meta: 'title="eslint.config.mjs"',
              type: 'code',
              value: `export default tseslint.config(${eslintConfig});`,
            },
          ],
          name: 'TabItem',
          type: 'mdxJsxFlowElement',
        },
        {
          attributes: [
            {
              name: 'value',
              type: 'mdxJsxAttribute',
              value: 'Legacy Config',
            },
          ],
          children: [
            {
              lang: 'js',
              meta: 'title=".eslintrc.cjs"',
              type: 'code',
              value: `module.exports = ${eslintrc};`,
            },
          ],
          name: 'TabItem',
          type: 'mdxJsxFlowElement',
        },
      ],
      name: 'Tabs',
      type: 'mdxJsxFlowElement',
    } as MdxJsxFlowElement,
    {
      attributes: [
        {
          name: 'eslintrcHash',
          type: 'mdxJsxAttribute',
          value: convertToPlaygroundHash(eslintrc),
        },
      ],
      children: [
        {
          children: [
            {
              type: 'text',
              value: 'Try this rule in the playground ↗',
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
    page.spliceChildren(
      page.headingIndices.options + 1,
      0,
      'This rule is not configurable.',
    );
  } else if (!COMPLICATED_RULE_OPTIONS.has(page.file.stem)) {
    page.spliceChildren(
      page.headingIndices.options + 1,
      0,
      typeof page.rule.meta.docs.recommended === 'object'
        ? linkToConfigsForObject(page.rule.meta.docs)
        : 'This rule accepts the following options:',
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

function linkToConfigsForObject(docs: ESLintPluginDocs): string {
  return [
    'This rule accepts the following options, and has more strict settings in the',
    (docs.requiresTypeChecking ? ['strict', 'strict-type-checked'] : ['strict'])
      .map(config => `[${config}](/users/configs#${config})`)
      .join(' and '),
    `config${docs.requiresTypeChecking ? 's' : ''}.`,
  ].join(' ');
}

function getRuleDefaultOptions(page: RuleDocsPage): string {
  const defaults = JSON.stringify(page.rule.defaultOptions);
  const recommended = page.rule.meta.docs.recommended;

  return typeof recommended === 'object'
    ? [
        ...(recommended.recommended
          ? [
              `const defaultOptionsRecommended: Options = ${defaults};`,
              '',
              '// These options are merged on top of the recommended defaults',
            ]
          : []),
        `const defaultOptionsStrict: Options = ${JSON.stringify(recommended.strict)};`,
      ].join('\n')
    : `const defaultOptions: Options = ${defaults};`;
}
