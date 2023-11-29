import type * as mdast from 'mdast';
import type * as unist from 'unist';

import type { RequiredHeadingIndices, RuleMetaDataWithDocs } from '../utils';
import { nodeIsHeading, spliceChildrenAndAdjustHeadings } from '../utils';

export function insertWhenNotToUseIt(
  children: unist.Node[],
  headingIndices: RequiredHeadingIndices,
  meta: RuleMetaDataWithDocs,
): void {
  if (!meta.docs.requiresTypeChecking) {
    return;
  }

  const hasExistingText =
    headingIndices.whenNotToUseIt < children.length - 1 &&
    children[headingIndices.whenNotToUseIt + 1].type !== 'heading';

  const nextHeadingIndex =
    children.findIndex(
      child => nodeIsHeading(child) && child.depth === 2,
      headingIndices.whenNotToUseIt + 1,
    ) +
    headingIndices.whenNotToUseIt +
    1;

  spliceChildrenAndAdjustHeadings(
    children,
    headingIndices,
    nextHeadingIndex === -1 ? children.length : nextHeadingIndex - 1,
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
          url: `/linting/typed-linting`,
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
          url: `/linting/troubleshooting/performance-troubleshooting`,
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
