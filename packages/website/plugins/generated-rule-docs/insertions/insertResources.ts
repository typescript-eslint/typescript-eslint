import type * as mdast from 'mdast';

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
      children: [
        {
          type: 'jsx',
          value: '<sup>',
        },
        {
          type: 'text',
          value: 'Taken with ❤️ ',
        },
        {
          type: 'link',
          title: null,
          url: `https://github.com/eslint/eslint/blob/main/docs/src/rules/${
            page.rule.meta.docs.extendsBaseRule === true
              ? page.file.stem
              : page.rule.meta.docs.extendsBaseRule
          }.md`,
          children: [
            {
              type: 'text',
              value: 'from ESLint core',
            },
          ],
        },
        {
          type: 'jsx',
          value: '</sup>',
        },
      ],
      type: 'paragraph',
    } as mdast.Paragraph);
  }
}
