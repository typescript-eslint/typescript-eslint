import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';

import { getUrlForRuleTest, sourceUrlPrefix } from '../../utils/rules';

export function insertResources(page: RuleDocsPage): void {
  // Add a link to view the rule's source and test code
  page.spliceChildren(
    page.children.length,
    0,
    `## Resources

- [Rule source](${sourceUrlPrefix}src/rules/${page.file.stem}.ts)
- [Test source](${getUrlForRuleTest(page.file.stem)})
    `,
  );

  // Also add a notice about coming from ESLint core for extension rules
  if (page.rule.meta.docs.extendsBaseRule) {
    page.spliceChildren(page.children.length, 0, {
      attributes: [
        {
          name: 'baseRule',
          type: 'mdxJsxAttribute',
          value:
            page.rule.meta.docs.extendsBaseRule === true
              ? page.file.stem
              : page.rule.meta.docs.extendsBaseRule,
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
      name: 'BaseRuleReference',
      type: 'mdxJsxFlowElement',
    } as MdxJsxFlowElement);
  }
}
