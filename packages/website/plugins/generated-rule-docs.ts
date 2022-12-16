import * as eslintPlugin from '@typescript-eslint/eslint-plugin';
import * as tseslintParser from '@typescript-eslint/parser';
import * as fs from 'fs';
import type { JSONSchema7 } from 'json-schema';
import type { JSONSchema } from 'json-schema-to-typescript';
import { compile } from 'json-schema-to-typescript';
import type * as mdast from 'mdast';
import { EOL } from 'os';
import * as path from 'path';
import { format } from 'prettier';
import type { Plugin } from 'unified';
import type * as unist from 'unist';

/**
 * Rules whose options schema generate annoyingly complex schemas.
 *
 * @remarks These need to be typed in manually in their .md docs file.
 * @todo Get these schemas printing nicely in their .md docs files!
 */
const COMPLICATED_RULE_OPTIONS = new Set([
  'member-ordering',
  'naming-convention',
]);

const sourceUrlPrefix =
  'https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/';

const eslintPluginDirectory = path.resolve(
  path.join(__dirname, '../../eslint-plugin'),
);

function nodeIsParent(node: unist.Node<unist.Data>): node is unist.Parent {
  return 'children' in node;
}

export const generatedRuleDocs: Plugin = () => {
  return async (root, file) => {
    if (!nodeIsParent(root) || file.stem == null) {
      return;
    }

    const rule = eslintPlugin.rules[file.stem];
    const meta = rule?.meta;
    if (!meta?.docs) {
      return;
    }

    // 1. Remove the " 🛑 This file is source code, not the primary documentation location! 🛑"
    root.children.splice(
      root.children.findIndex(v => v.type === 'blockquote'),
      1,
    );

    // 2. Add a description of the rule at the top of the file
    root.children.unshift(
      {
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
      } as mdast.Blockquote,
      {
        type: 'jsx',
        value: `<rule-attributes name="${file.stem}" />`,
      } as unist.Node,
    );

    // 3. Add a notice about formatting rules being 🤢
    if (meta.type === 'layout') {
      const warningNode = {
        value: `
<admonition type="warning">
  We strongly recommend you do not use this rule or any other formatting linter rules.
  Use a separate dedicated formatter instead.
  See <a href="/linting/troubleshooting/formatting">What About Formatting?</a> for more information.
</admonition>
`,
        type: 'jsx',
      };
      root.children.unshift(warningNode);
    }

    // 4. Make sure the appropriate headers exist to place content under
    const [howToUseH2Index, optionsH2Index] = ((): [number, number] => {
      let howToUseH2Index = root.children.findIndex(
        createH2TextFilter('How to Use'),
      );
      let optionsH2Index = root.children.findIndex(
        createH2TextFilter('Options'),
      );
      const relatedToH2Index = root.children.findIndex(
        createH2TextFilter('Related To'),
      );
      let whenNotToUseItH2Index = root.children.findIndex(
        createH2TextFilter('When Not To Use It'),
      );

      if (meta.docs.extendsBaseRule) {
        if (howToUseH2Index === -1) {
          if (optionsH2Index !== -1) {
            howToUseH2Index = optionsH2Index;
            optionsH2Index += 1;

            if (whenNotToUseItH2Index !== -1) {
              whenNotToUseItH2Index += 1;
            }
          } else {
            howToUseH2Index =
              whenNotToUseItH2Index === -1
                ? root.children.length
                : ++whenNotToUseItH2Index;
          }

          root.children.splice(howToUseH2Index, 0, {
            children: [
              {
                type: 'text',
                value: 'How to Use',
              },
            ],
            depth: 2,
            type: 'heading',
          } as mdast.Heading);
        }
      }

      if (optionsH2Index === -1) {
        optionsH2Index =
          whenNotToUseItH2Index === -1
            ? relatedToH2Index === -1
              ? root.children.length
              : relatedToH2Index
            : whenNotToUseItH2Index;
        root.children.splice(optionsH2Index, 0, {
          children: [
            {
              type: 'text',
              value: 'Options',
            },
          ],
          depth: 2,
          type: 'heading',
        } as mdast.Heading);

        optionsH2Index += 1;
      }

      return [howToUseH2Index, optionsH2Index];
    })();

    // 5. Add a description of how to use / options for the rule

    if (meta.docs.extendsBaseRule) {
      const extendsBaseRuleName =
        typeof meta.docs.extendsBaseRule === 'string'
          ? meta.docs.extendsBaseRule
          : file.stem;

      root.children.splice(optionsH2Index + 1, 0, {
        children: [
          {
            value: 'See ',
            type: 'text',
          },
          {
            children: [
              {
                type: 'inlineCode',
                value: `eslint/${extendsBaseRuleName}`,
              },
              {
                type: 'text',
                value: ' options',
              },
            ],
            type: 'link',
            url: `https://eslint.org/docs/rules/${extendsBaseRuleName}#options`,
          },
          {
            type: 'text',
            value: '.',
          },
        ],
        type: 'paragraph',
      } as mdast.Paragraph);

      root.children.splice(howToUseH2Index + 1, 0, {
        lang: 'js',
        type: 'code',
        meta: 'title=".eslintrc.cjs"',
        value: `module.exports = {
  "rules": {
    // Note: you must disable the base rule as it can report incorrect errors
    "${extendsBaseRuleName}": "off",
    "@typescript-eslint/${file.stem}": "warn"
  }
};`,
      } as mdast.Code);
    } else {
      // For non-extended rules, the code snippet is placed before the first h2
      // (i.e. at the end of the initial explanation)
      const firstH2Index = root.children.findIndex(
        child => nodeIsHeading(child) && child.depth === 2,
      );
      root.children.splice(firstH2Index, 0, {
        lang: 'js',
        type: 'code',
        meta: 'title=".eslintrc.cjs"',
        value: `module.exports = {
  "rules": {
    "@typescript-eslint/${file.stem}": "warn"
  }
};`,
      } as mdast.Code);

      if (meta.schema.length === 0) {
        root.children.splice(optionsH2Index + 1, 0, {
          children: [
            {
              type: 'text',
              value: 'This rule is not configurable.',
            },
          ],
          type: 'paragraph',
        } as mdast.Paragraph);
      } else if (!COMPLICATED_RULE_OPTIONS.has(file.stem)) {
        const optionsSchema: JSONSchema =
          meta.schema instanceof Array
            ? meta.schema[0]
            : meta.schema.type === 'array'
            ? {
                ...(meta.schema.definitions
                  ? { definitions: meta.schema.definitions }
                  : {}),
                ...(meta.schema.$defs
                  ? { $defs: (meta.schema as JSONSchema7).$defs }
                  : {}),
                ...(meta.schema.prefixItems as [JSONSchema])[0],
              }
            : meta.schema;

        root.children.splice(
          optionsH2Index + 2,
          0,
          {
            children: [
              {
                type: 'text',
                value: `This rule accepts an options ${
                  'enum' in optionsSchema
                    ? 'string of the following possible values'
                    : 'object with the following properties'
                }:`,
              } as mdast.Text,
            ],
            type: 'paragraph',
          } as mdast.Paragraph,
          {
            lang: 'ts',
            type: 'code',
            value: [
              (
                await compile(
                  {
                    title: `Options`,
                    ...optionsSchema,
                  },
                  file.stem,
                  {
                    additionalProperties: false,
                    bannerComment: '',
                    declareExternallyReferenced: true,
                  },
                )
              ).replace(/^export /gm, ''),
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
          } as mdast.Code,
        );
      }
    }

    // 6. Add a notice about coming from ESLint core for extension rules
    if (meta.docs.extendsBaseRule) {
      root.children.push({
        children: [
          {
            type: 'jsx',
            value: '<sup>',
          },
          {
            type: 'text',
            value: 'Taken with ❤️ ',
          },
          {
            type: 'link',
            title: null,
            url: `https://github.com/eslint/eslint/blob/main/docs/rules/${meta.docs.extendsBaseRule}.md`,
            children: [
              {
                type: 'text',
                value: 'from ESLint core',
              },
            ],
          },
          {
            type: 'jsx',
            value: '</sup>',
          },
        ],
        type: 'paragraph',
      } as mdast.Paragraph);
    }

    // 7. Also add a link to view the rule's source and test code
    root.children.push(
      {
        children: [
          {
            type: 'text',
            value: 'Resources',
          },
        ],
        depth: 2,
        type: 'heading',
      } as mdast.Heading,
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    type: 'link',
                    url: `${sourceUrlPrefix}src/rules/${file.stem}.ts`,
                    children: [
                      {
                        type: 'text',
                        value: 'Rule source',
                      },
                    ],
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'listItem',
          },
          {
            children: [
              {
                children: [
                  {
                    type: 'link',
                    url: getUrlForRuleTest(file.stem),
                    children: [
                      {
                        type: 'text',
                        value: 'Test source',
                      },
                    ],
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'listItem',
          },
        ],
        type: 'list',
      } as mdast.List,
    );
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

function getUrlForRuleTest(ruleName: string): string {
  for (const localPath of [
    `tests/rules/${ruleName}.test.ts`,
    `tests/rules/${ruleName}/`,
  ]) {
    if (fs.existsSync(`${eslintPluginDirectory}/${localPath}`)) {
      return `${sourceUrlPrefix}${localPath}`;
    }
  }

  throw new Error(`Could not find test file for ${ruleName}.`);
}
