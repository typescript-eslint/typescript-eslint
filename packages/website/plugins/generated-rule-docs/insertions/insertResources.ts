import type * as mdast from 'mdast';
import type * as unist from 'unist';

import type { RuleMetaDataWithDocs, VFileWithStem } from '../utils';
import { getUrlForRuleTest, sourceUrlPrefix } from '../utils';

export function insertResources(
  children: unist.Node[],
  file: VFileWithStem,
  meta: RuleMetaDataWithDocs,
): void {
  // Add a link to view the rule's source and test code
  children.push(
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
                  url: `${sourceUrlPrefix}src/rules/${file.stem}.ts`,
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
                  url: getUrlForRuleTest(file.stem),
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
  if (meta.docs.extendsBaseRule) {
    children.push({
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
            meta.docs.extendsBaseRule === true
              ? file.stem
              : meta.docs.extendsBaseRule
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
