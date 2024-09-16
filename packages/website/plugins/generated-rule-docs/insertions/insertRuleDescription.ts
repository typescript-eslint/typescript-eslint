import type { MdxJsxFlowElement } from 'mdast-util-mdx';

import type { RuleDocsPage } from '../RuleDocsPage';

export function insertRuleDescription(page: RuleDocsPage): void {
  page.spliceChildren(0, 0, `> ${page.rule.meta.docs.description}.`, {
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'name',
        value: page.file.stem,
      },
    ],
    name: 'RuleAttributes',
    type: 'mdxJsxFlowElement',
  } as MdxJsxFlowElement);
}
