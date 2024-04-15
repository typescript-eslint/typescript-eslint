import type * as mdast from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';

export function insertRuleDescription(page: RuleDocsPage): void {
  page.spliceChildren(
    0,
    0,
    {
      children: [
        {
          children: page.rule.meta.docs.description
            .split(/`(.+?)`/)
            .map((value, index, array) => ({
              type: index % 2 === 0 ? 'text' : 'inlineCode',
              value: index === array.length - 1 ? `${value}.` : value,
            })),
          type: 'paragraph',
        },
      ],
      type: 'blockquote',
    } as mdast.Blockquote,
    {
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'name',
          value: page.file.stem,
        },
      ],
      name: 'RuleAttributes',
      type: 'mdxJsxFlowElement',
    } as MdxJsxFlowElement,
  );
}
