import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import { convertToPlaygroundHash, getRulesString } from '../../utils/rules';
import type { RuleDocsPage } from '../RuleDocsPage';

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
      type: 'mdxJsxFlowElement',
      name: 'Tabs',
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'TabItem',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'value',
              value: 'Flat Config',
            },
          ],
          children: [
            {
              type: 'code',
              lang: 'js',
              meta: 'title="eslint.config.mjs"',
              value: `export default tseslint.config({
  rules: ${getRulesString(extendsBaseRuleName, page.file.stem, true)}
});`,
            },
          ],
        },
        {
          type: 'mdxJsxFlowElement',
          name: 'TabItem',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'value',
              value: 'Legacy Config',
            },
          ],
          children: [
            {
              type: 'code',
              lang: 'js',
              meta: 'title=".eslintrc.cjs"',
              value: `module.exports = {
  "rules": ${getRulesString(extendsBaseRuleName, page.file.stem, true)}
};`,
            },
          ],
        },
      ],
    } as MdxJsxFlowElement,
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
