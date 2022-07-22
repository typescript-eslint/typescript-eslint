import type * as unist from 'unist';
import type * as mdast from 'mdast';
import type { Plugin } from 'unified';

import * as eslintPlugin from '@typescript-eslint/eslint-plugin';

const generatedRuleDocs: Plugin = () => {
  return (root, file) => {
    if (file.stem == null) {
      return;
    }

    const docs = eslintPlugin.rules[file.stem]?.meta.docs;
    if (!docs) {
      return;
    }

    const parent = root as unist.Parent;

    // 1. Remove the " 🛑 This file is source code, not the primary documentation location! 🛑"
    parent.children.splice(3, 1);

    // 2. Add a description of the rule at the top of the file
    parent.children.unshift({
      children: [
        {
          children: [
            {
              type: 'text',
              value: `${docs.description}.`,
            },
          ],
          type: 'paragraph',
        },
      ],
      type: 'blockquote',
    } as mdast.Blockquote);

    // 3. Add a rule attributes list...
    const h2Idx =
      // ...before the first h2, if it exists...
      parent.children.findIndex(
        child =>
          child.type === 'heading' && (child as mdast.Heading).depth === 2,
      ) ??
      // ...or at the very end, if not.
      parent.children.length;

    // The actual content will be injected on client side.
    const attrNode = {
      type: 'jsx',
      value: `<rule-attributes name="${file.stem}" />`,
    };
    parent.children.splice(h2Idx, 0, attrNode);
  };
};

export { generatedRuleDocs };
