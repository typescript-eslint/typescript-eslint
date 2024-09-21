import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import { getUrlForRuleTest, sourceUrlPrefix } from '../../utils/rules';
import type { RuleDocsPage } from '../RuleDocsPage';

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
          type: 'mdxJsxAttribute',
          name: 'baseRule',
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
              value: 'Try this rule in the playground ↗',
              type: 'text',
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
