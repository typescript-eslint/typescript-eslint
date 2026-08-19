import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';

export function insertSocialImageAlt(page: RuleDocsPage): void {
  page.spliceChildren(page.children.length, 0, {
    attributes: [],
    children: [
      {
        attributes: [
          {
            name: 'content',
            type: 'mdxJsxAttribute',
            value: `${page.file.stem}: ${page.rule.meta.docs.description}`,
          },
          {
            name: 'name',
            type: 'mdxJsxAttribute',
            value: 'twitter:image:alt',
          },
        ],
        children: [],
        name: 'meta',
        type: 'mdxJsxFlowElement',
      },
    ],
    name: 'Head',
    type: 'mdxJsxFlowElement',
  } as MdxJsxFlowElement);
}
