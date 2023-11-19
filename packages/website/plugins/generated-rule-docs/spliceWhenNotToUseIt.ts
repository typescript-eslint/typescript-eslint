import type * as mdast from 'mdast';
import type * as unist from 'unist';

import type { RequiredHeadingIndices } from './requiredHeadings';
import { spliceChildrenAndAdjustHeadings } from './splicing';
import type { RuleMetaDataWithDocs } from './types';

export function spliceWhenNotToUseIt(
  children: unist.Node[],
  headingIndices: RequiredHeadingIndices,
  meta: RuleMetaDataWithDocs,
): void {
  if (!meta.docs.requiresTypeChecking) {
    return;
  }

  spliceChildrenAndAdjustHeadings(
    children,
    headingIndices,
    headingIndices.whenNotToUseIt + 1,
    0,
    {
      children: [
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
