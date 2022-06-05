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
    const config = ((): 'recommended' | 'strict' | null => {
      switch (rule.meta.docs?.recommended) {
        case 'error':
        case 'warn':
          return 'recommended';

        case 'strict':
          return 'strict';

        default:
          return null;
      }
    })();
    const autoFixable = rule.meta.fixable != null;
    const suggestionFixable = rule.meta.hasSuggestions === true;
    const requiresTypeInfo = rule.meta.docs?.requiresTypeChecking === true;

    const parent = root as mdast.Parent;
    /*
    This just outputs a list with a heading like:

## Attributes

- [ ] Config
  - [ ] ✅ Recommended
  - [ ] 🔒 Strict
- [ ] Fixable
  - [ ] 🔧 Automated Fixer (`--fix`)
  - [ ] 🛠 Suggestion Fixer
- [ ] 💭 Requires type information
    */
    const heading = Heading({
      depth: 2,
      text: 'Attributes',
    });
    const ruleAttributes = List({
      children: [
        NestedList({
          checked: config != null,
          children: [
            ListItem({
              checked: config === 'recommended',
              text: '✅ Recommended',
            }),
            ListItem({
              checked: config === 'strict' || config === 'recommended',
              text: '🔒 Strict',
            }),
          ],
          text: 'Included in configs',
        }),
        NestedList({
          checked: autoFixable || suggestionFixable,
          children: [
            ListItem({
              checked: autoFixable,
              text: '🔧 Automated Fixer',
            }),
            ListItem({
              checked: suggestionFixable,
              text: '🛠 Suggestion Fixer',
            }),
          ],
          text: 'Fixable',
        }),
        ListItem({
          checked: requiresTypeInfo,
          text: '💭 Requires type information',
        }),
      ],
    });

    const h2Idx = parent.children.findIndex(
      child => child.type === 'heading' && child.depth === 2,
    );
    if (h2Idx != null) {
      // insert it just before the first h2 in the doc
      // this should be just after the rule's description
      parent.children.splice(h2Idx, 0, heading, ruleAttributes);
    } else {
      // failing that, add it to the end
      parent.children.push(heading, ruleAttributes);
    }
  };
};

function Heading({
  depth,
  text,
  id = text.toLowerCase(),
}: {
  depth: mdast.Heading['depth'];
  id?: string;
  text: string;
}): mdast.Heading {
  return {
    type: 'heading',
    depth,
    children: [
      {
        type: 'text',
        value: text,
      },
    ],
    data: {
      hProperties: {
        id,
      },
      id,
    },
  };
}

function Paragraph({ text }: { text: string }): mdast.Paragraph {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: text,
      },
    ],
  };
}

function ListItem({
  checked,
  text,
}: {
  checked: boolean;
  text: string;
}): mdast.ListItem {
  return {
    type: 'listItem',
    spread: false,
    checked: checked,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: text,
          },
        ],
      },
    ],
  };
}

function NestedList({
  children,
  checked,
  text,
}: {
  children: mdast.ListItem[];
  checked: boolean;
  text: string;
}): mdast.ListItem {
  return {
    type: 'listItem',
    spread: false,
    checked: checked,
    children: [
      Paragraph({
        text,
      }),
      List({
        children,
      }),
    ],
    data: {
      className: 'test',
    },
  };
}

function List({ children }: { children: mdast.ListItem[] }): mdast.List {
  return {
    type: 'list',
    ordered: false,
    start: null,
    spread: false,
    children,
  };
}

export { addRuleAttributesList };
