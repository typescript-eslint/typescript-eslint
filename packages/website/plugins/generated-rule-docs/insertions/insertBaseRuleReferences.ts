import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';

import { convertToPlaygroundHash, getRulesString } from '../../utils/rules';

export function insertBaseRuleReferences(page: RuleDocsPage): string {
  const extendsBaseRuleName =
    typeof page.rule.meta.docs.extendsBaseRule === 'string'
      ? page.rule.meta.docs.extendsBaseRule
      : page.file.stem;

  page.spliceChildren(
    page.headingIndices.options + 1,
    0,
    `See [\`eslint/${extendsBaseRuleName}\`'s options](https://eslint.org/docs/rules/${extendsBaseRuleName}#options).`,
  );

  const eslintrc = `{
  "rules": ${getRulesString(extendsBaseRuleName, page.file.stem, false)}
}`;
  const eslintrcHash = convertToPlaygroundHash(eslintrc);

  page.spliceChildren(
    page.headingIndices.howToUse + 1,
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
              value: `export default tseslint.config({
  rules: ${getRulesString(extendsBaseRuleName, page.file.stem, true)}
});`,
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
              value: `module.exports = {
  "rules": ${getRulesString(extendsBaseRuleName, page.file.stem, true)}
};`,
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
          value: eslintrcHash,
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

  return eslintrc;
}
