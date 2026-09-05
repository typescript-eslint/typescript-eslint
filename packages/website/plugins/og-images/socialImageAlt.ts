import type { MdxJsxFlowElement } from 'mdast-util-mdx';
import type { Plugin } from 'unified';

import * as fs from 'node:fs/promises';

import { nodeIsParent } from '../utils/nodes';
import { getCard } from './getCard';

export const socialImageAlt: Plugin = () => async (root, file) => {
  if (!nodeIsParent(root)) {
    return;
  }

  // Read from disk so the alt text describes the card, which is rendered from
  // the file's contents before MDX preprocessing.
  const image = await getCard(file.path, await fs.readFile(file.path, 'utf8'));

  if (!image) {
    return;
  }

  const { description, title } = image.card;

  root.children.push({
    attributes: [],
    children: [
      {
        attributes: [
          {
            name: 'content',
            type: 'mdxJsxAttribute',
            value: description ? `${title}: ${description}` : title,
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
};
