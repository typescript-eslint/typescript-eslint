import type * as unist from 'unist';
import * as mdast from 'mdast';
import { format } from 'prettier';
import type { Plugin } from 'unified';
import { JSONSchema4Object } from 'json-schema';
import { compile } from 'json-schema-to-typescript';

import * as tseslintParser from '@typescript-eslint/parser';
import * as eslintPlugin from '@typescript-eslint/eslint-plugin';
import { EOL } from 'os';

const generatedRuleDocs: Plugin = () => {
  return async (root, file) => {
    if (file.stem == null) {
      return;
    }

    const rule = eslintPlugin.rules[file.stem];
    const meta = rule?.meta;
    if (!meta?.docs) {
      return;
    }

    const parent = root as unist.Parent;

    // 1. Remove the " 🛑 This file is source code, not the primary documentation location! 🛑"
    parent.children.splice(
      parent.children.findIndex(v => v.type === 'blockquote'),
      1,
    );

    // 2. Add a description of the rule at the top of the file
    parent.children.unshift({
      children: [
        {
          children: meta.docs.description
            .split(/`(.+?)`/)
            .map((value, index, array) => ({
              type: index % 2 === 0 ? 'text' : 'inlineCode',
              value: index === array.length - 1 ? `${value}.` : value,
            })),
          type: 'paragraph',
        },
      ],
      type: 'blockquote',
    } as mdast.Blockquote);

    // 3. Add a rule attributes list...
    const attributesH2Index =
      // ...before the first h2, if it exists...
      parent.children.findIndex(
        child => nodeIsHeading(child) && child.depth === 2,
      ) ??
      // ...or at the very end, if not.
      parent.children.length;

    // The actual content will be injected on client side.
    const attributesNode = {
      type: 'jsx',
      value: `<rule-attributes name="${file.stem}" />`,
    };
    parent.children.splice(attributesH2Index, 0, attributesNode);

    // 4. Add a description of how to use / options for the rule
    const optionLevel = meta.docs.recommended === 'error' ? 'error' : 'warn';
    if (meta.docs.extendsBaseRule) {
      const howToUseH2Index = parent.children.findIndex(
        createH2TextFilter('How to Use'),
      );

      parent.children.splice(
        howToUseH2Index + 1,
        0,
        {
          lang: 'jsonc',
          type: 'code',
          value: `// .eslintrc.json
{
  // note you must disable the base rule as it can report incorrect errors
  "${file.stem}": "off",
  "@typescript-eslint/${file.stem}": "${optionLevel}"
}`,
        } as mdast.Code,
        {
          children: [
            {
              type: 'text',
              value: 'Options',
            },
          ],
          depth: 2,
          type: 'heading',
        } as mdast.Heading,
        {
          children: [
            {
              value: 'See ',
              type: 'text',
            },
            {
              children: [
                {
                  type: 'inlineCode',
                  value: `eslint/${file.stem}`,
                },
                {
                  type: 'text',
                  value: ' options',
                },
              ],
              type: 'link',
              url: `https://eslint.org/docs/rules/${file.stem}#options`,
            },
            {
              type: 'text',
              value: '.',
            },
          ],
          type: 'paragraph',
        } as mdast.Paragraph,
        // todo: add more?
      );
    } else {
      let optionsH2Index = parent.children.findIndex(
        createH2TextFilter('Options'),
      );

      if (optionsH2Index === -1) {
        const whenNotToUseItH2Index = parent.children.findIndex(
          createH2TextFilter('When Not To Use It'),
        );
        optionsH2Index =
          whenNotToUseItH2Index === -1
            ? parent.children.length - 1
            : whenNotToUseItH2Index;

        parent.children.splice(optionsH2Index, 0, {
          children: [
            {
              type: 'text',
              value: 'Options',
            },
          ],
          depth: 2,
          type: 'heading',
        } as mdast.Heading);
      }

      if (meta.schema.length === 0) {
        parent.children.splice(
          optionsH2Index + 1,
          0,
          {
            lang: 'jsonc',
            type: 'code',
            value: `// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/${file.stem}": "${optionLevel}"
  }
}`,
          } as mdast.Code,
          {
            children: [
              {
                type: 'text',
                value: 'This rule is not configurable.',
              },
            ],
            type: 'paragraph',
          } as mdast.Paragraph,
        );
      } else {
        const optionsInterface = await compile(
          {
            title: `Options`,
            ...(meta.schema[0] as JSONSchema4Object),
          },
          file.stem,
          { additionalProperties: false, bannerComment: '' },
        );

        parent.children.splice(optionsH2Index + 1, 0, {
          lang: 'ts',
          type: 'code',
          value: [
            optionsInterface.replace(/^export /g, ''),
            format(
              `const defaultOptions: Options = ${JSON.stringify(
                rule.defaultOptions,
              )};`,
              {
                parser: tseslintParser.parse,
              },
            ),
          ]
            .join(EOL)
            .trim(),
        } as mdast.Code);
      }
    }

    // 5. Add a notice about coming from ESLint core for extension rules
    if (meta.docs.extendsBaseRule) {
      parent.children.push(
        {
          type: 'html',
          value: '<sup>',
        } as mdast.HTML,
        {
          children: [
            {
              type: 'text',
              value: 'Taken with ❤️ ',
            },
            {
              children: [
                {
                  type: 'text',
                  value: 'from ESLint core',
                },
              ],
              type: 'link',
              url: 'https://github.com/eslint/eslint/blob/main/docs/rules/require-await.md',
            },
          ],
          type: 'paragraph',
        } as mdast.Paragraph,
        {
          type: 'html',
          value: '</sup>',
        } as mdast.HTML,
      );
    }

    // TODO: find & use library that converts text to markdown ast
    // (that'll fix the <sup> not applying issue)
  };
};

function nodeIsHeading(node: unist.Node): node is mdast.Heading {
  return node.type === 'heading';
}

function createH2TextFilter(
  text: string,
): (node: unist.Node) => node is mdast.Heading {
  return (node: unist.Node): node is mdast.Heading =>
    nodeIsHeading(node) &&
    node.depth === 2 &&
    node.children.length === 1 &&
    node.children[0].type === 'text' &&
    node.children[0].value === text;
}

export { generatedRuleDocs };
