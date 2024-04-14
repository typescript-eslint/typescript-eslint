import type * as mdast from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';
import { convertToPlaygroundHash, getEslintrcString } from '../utils';

export function insertBaseRuleReferences(page: RuleDocsPage): string {
  const extendsBaseRuleName =
    typeof page.rule.meta.docs.extendsBaseRule === 'string'
      ? page.rule.meta.docs.extendsBaseRule
      : page.file.stem;

  page.spliceChildren(page.headingIndices.options + 1, 0, {
    children: [
      {
        value: 'See ',
        type: 'text',
      },
      {
        children: [
          {
            type: 'inlineCode',
            value: `eslint/${extendsBaseRuleName}`,
          },
          {
            type: 'text',
            value: ' options',
          },
        ],
        type: 'link',
        url: `https://eslint.org/docs/rules/${extendsBaseRuleName}#options`,
      },
      {
        type: 'text',
        value: '.',
      },
    ],
    type: 'paragraph',
  } as mdast.Paragraph);

  const eslintrc = getEslintrcString(
    extendsBaseRuleName,
    page.file.stem,
    false,
  );
  const eslintrcHash = convertToPlaygroundHash(eslintrc);

  page.spliceChildren(
    page.headingIndices.howToUse + 1,
    0,
    {
      lang: 'js',
      type: 'code',
      meta: 'title=".eslintrc.cjs"',
      value: `module.exports = ${getEslintrcString(
        extendsBaseRuleName,
        page.file.stem,
        true,
      )};`,
    } as mdast.Code,
    {
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'eslintrcHash',
          value: eslintrcHash,
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

  return eslintrc;
}
