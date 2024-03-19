import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';

export function insertFormattingNotice(page: RuleDocsPage): void {
  const replacement = page.rule.meta.replacedBy?.find(e =>
    e.startsWith('@stylistic/'),
  );
  if (!replacement) {
    return;
  }

  const url =
    replacement &&
    `https://eslint.style/rules/${replacement.replace('@stylistic/', '')}`;

  page.spliceChildren(0, 0, {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'Formatting rules now live in ',
          },
          {
            type: 'link',
            title: null,
            url: 'https://eslint.style',
            children: [
              {
                type: 'text',
                value: 'eslint-stylistic',
              },
            ],
          },
          {
            type: 'text',
            value: '. ',
          },
          ...(url
            ? [
                {
                  type: 'link',
                  title: null,
                  url,
                  children: [
                    {
                      type: 'text',
                      value: replacement,
                    },
                  ],
                },
                {
                  type: 'text',
                  value: ' is the replacement for this rule. ',
                },
              ]
            : []),
          {
            type: 'break',
          },
          {
            type: 'text',
            value: 'See ',
          },
          {
            type: 'link',
            title: null,
            url: '/blog/deprecating-formatting-rules',
            children: [
              {
                type: 'text',
                value: 'Deprecating Formatting Rules',
              },
            ],
          },
          {
            type: 'text',
            value: ' for more information.',
          },
        ],
      },
    ],
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'title',
        value: 'Deprecated',
      },
      {
        type: 'mdxJsxAttribute',
        name: 'type',
        value: 'danger',
      },
    ],
    name: 'Admonition',
    type: 'mdxJsxFlowElement',
  } as MdxJsxFlowElement);
}
