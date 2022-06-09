import type * as unist from 'unist';
import type * as mdast from 'mdast';
import type { Plugin } from 'unified';

import * as eslintPlugin from '@typescript-eslint/eslint-plugin';

const addRuleAttributesList: Plugin = () => {
  return (root, file) => {
    if (file.stem == null) {
      return;
    }

    const rule = eslintPlugin.rules[file.stem];
    if (rule == null) {
      return;
    }

    const parent = root as unist.Parent;
    const h2Idx = parent.children.findIndex(
      child => child.type === 'heading' && (child as mdast.Heading).depth === 2,
    );
    // The actual content will be injected on client side.
    const attrNode = {
      type: 'jsx',
      value: `<rule-attributes name="${file.stem}" />`,
    };
    if (h2Idx != null) {
      // insert it just before the first h2 in the doc
      // this should be just after the rule's description
      parent.children.splice(h2Idx, 0, attrNode);
    } else {
      // failing that, add it to the end
      parent.children.push(attrNode);
    }
  };
};

export { addRuleAttributesList };
