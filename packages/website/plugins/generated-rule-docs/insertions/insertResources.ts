import type * as mdast from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';
import { getUrlForRuleTest, sourceUrlPrefix } from '../utils';

export function insertResources(page: RuleDocsPage): void {
  // Add a link to view the rule's source and test code
  page.spliceChildren(
    page.children.length,
    0,
    {
      children: [
        {
          type: 'text',
          value: 'Resources',
        },
      ],
      depth: 2,
      type: 'heading',
    } as mdast.Heading,
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  type: 'link',
                  url: `${sourceUrlPrefix}src/rules/${page.file.stem}.ts`,
                  children: [
                    {
                      type: 'text',
                      value: 'Rule source',
                    },
                  ],
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'listItem',
        },
        {
          children: [
            {
              children: [
                {
                  type: 'link',
                  url: getUrlForRuleTest(page.file.stem),
                  children: [
                    {
                      type: 'text',
                      value: 'Test source',
                    },
                  ],
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'listItem',
        },
      ],
      type: 'list',
    } as mdast.List,
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
