import type * as mdast from 'mdast';
import type { Plugin } from 'unified';

import { nodeIsParent } from './utils/nodes';

export const blogFooter: Plugin = () => {
  return (root, file) => {
    if (
      !nodeIsParent(root) ||
      !(file.value as string).includes('<!--truncate-->')
    ) {
      return;
    }

    root.children.push(
      {
        children: [
          {
            type: 'text',
            value: 'Supporting typescript-eslint',
          },
        ],
        depth: 2,
        type: 'heading',
      } as mdast.Heading,
      {
        children: [
          {
            type: 'text',
            value:
              'If you enjoyed this blog post and/or use typescript-eslint, please consider ',
          },
          {
            children: [
              {
                type: 'text',
                value: 'supporting us on Open Collective',
              },
            ],
            url: 'https://opencollective.com/typescript-eslint',
            type: 'link',
          },
          {
            type: 'text',
            value: `. We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great. Thanks! 💖`,
          },
        ],
        type: 'paragraph',
      } as mdast.Paragraph,
    );
  };
};
