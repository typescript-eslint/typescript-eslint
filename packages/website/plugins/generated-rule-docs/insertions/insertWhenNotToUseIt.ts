import type * as mdast from 'mdast';

import type { RuleDocsPage } from '../RuleDocsPage';
import { nodeIsHeading } from '../utils';

export function insertWhenNotToUseIt(page: RuleDocsPage): void {
  if (!page.rule.meta.docs.requiresTypeChecking) {
    return;
  }

  const hasExistingText =
    page.headingIndices.whenNotToUseIt < page.children.length - 1 &&
    page.children[page.headingIndices.whenNotToUseIt + 1].type !== 'heading';

  const nextHeadingIndex =
    page.children.findIndex(
      child => nodeIsHeading(child) && child.depth === 2,
      page.headingIndices.whenNotToUseIt + 1,
    ) +
    page.headingIndices.whenNotToUseIt +
    1;

  page.spliceChildren(
    nextHeadingIndex === -1 ? page.children.length : nextHeadingIndex - 1,
    0,
    {
      children: [
        ...(hasExistingText ? [{ type: 'thematicBreak' }] : []),
        {
          type: 'text',
          value:
            'Type checked lint rules are more powerful than traditional lint rules, but also require configuring ',
        },
        {
          type: 'link',
          title: null,
          url: `/getting-started/typed-linting`,
          children: [
            {
              type: 'text',
              value: 'type checked linting',
            },
          ],
        },
        {
          type: 'text',
          value: '. See ',
        },
        {
          type: 'link',
          title: null,
          url: `/troubleshooting/performance-troubleshooting`,
          children: [
            {
              type: 'text',
              value: 'Performance Troubleshooting',
            },
          ],
        },
        {
          type: 'text',
          value:
            ' if you experience performance degredations after enabling type checked rules.',
        },
      ],
      type: 'paragraph',
    } as mdast.Paragraph,
  );
}
