import prettier from '@prettier/sync';
import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import { compile } from '@typescript-eslint/rule-schema-to-typescript-types';
import * as fs from 'fs';
import * as lz from 'lz-string';
import type * as mdast from 'mdast';
import { EOL } from 'os';
import * as path from 'path';
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
/**
 * Rules that do funky things with their defaults and require special code
 * rather than just JSON.stringify-ing their defaults blob
 */
const SPECIAL_CASE_DEFAULTS = new Map([
  //
  ['ban-types', '[{ /* See below for default options */ }]'],
]);

const prettierConfig = {
  ...(prettier.resolveConfig(__filename) ?? {}),
  filepath: path.join(__dirname, 'defaults.ts'),
};

const sourceUrlPrefix =
  'https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/';

const eslintPluginDirectory = path.resolve(
  path.join(__dirname, '../../eslint-plugin'),
);

function nodeIsParent(node: unist.Node): node is unist.Parent {
  return 'children' in node;
}

export const generatedRuleDocs: Plugin = () => {
  return (root, file) => {
    if (!nodeIsParent(root) || file.stem == null) {
      return;
    }

    const rule = pluginRules[file.stem];
    const meta = rule?.meta;
    if (!meta?.docs) {
      return;
    }

    // Workaround for root being un-narrowed inside closures
    const children = root.children;

    // 1. Remove the " 🛑 This file is source code, not the primary documentation location! 🛑"
    children.splice(
      children.findIndex(v => v.type === 'blockquote'),
      1,
    );

    // 2. Add a description of the rule at the top of the file
    children.unshift(
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
      children.unshift(warningNode);
    }

    // 4. Make sure the appropriate headers exist to place content under
    // eslint-disable-next-line prefer-const
    let [howToUseH2Index, optionsH2Index] = ((): [number, number] => {
      // The first two may be autogenerated. Inserting one heading requires
      // shifting all following ones
      const headingNames = [
        'How to Use',
        'Options',
        'When Not To Use It',
        'Related To',
      ];
      const headingIndices = headingNames.map(text =>
        children.findIndex(
          (node: unist.Node): node is mdast.Heading =>
            nodeIsHeading(node) &&
            node.depth === 2 &&
            node.children.length === 1 &&
            node.children[0].type === 'text' &&
            node.children[0].value === text,
        ),
      );

      function insertIfMissing(name: string): void {
        const num = headingNames.indexOf(name);
        if (headingIndices[num] === -1) {
          const insertIndex =
            headingIndices.find(v => v !== -1) ?? children.length;
          children.splice(insertIndex, 0, {
            children: [
              {
                type: 'text',
                value: name,
              },
            ],
            depth: 2,
            type: 'heading',
          } as mdast.Heading);
          headingIndices[num] = insertIndex;
          for (let i = num + 1; i < headingIndices.length; i++) {
            if (headingIndices[i] !== -1) {
              headingIndices[i] += 1;
            }
          }
        }
      }

      insertIfMissing('Options');
      if (meta.docs.extendsBaseRule) {
        insertIfMissing('How to Use');
      }
      return [headingIndices[0], headingIndices[1]];
    })();

    if (meta.docs.extendsBaseRule) {
      const extendsBaseRuleName =
        typeof meta.docs.extendsBaseRule === 'string'
          ? meta.docs.extendsBaseRule
          : file.stem;

      children.splice(optionsH2Index + 1, 0, {
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

      /**
       * @param withComment Whether to include a full comment note.
       * @remarks `withComment` can't be used inside a JSON object which is needed for eslintrc in the playground
       */
      const getEslintrcString = (withComment: boolean): string => {
        return `{
  "rules": {${
    withComment
      ? '\n    // Note: you must disable the base rule as it can report incorrect errors'
      : ''
  }
    "${extendsBaseRuleName}": "off",
    "@typescript-eslint/${file.stem}": "error"
  }
}`;
      };

      children.splice(
        howToUseH2Index + 1,
        0,
        {
          lang: 'js',
          type: 'code',
          meta: 'title=".eslintrc.cjs"',
          value: `module.exports = ${getEslintrcString(true)};`,
        } as mdast.Code,
        {
          value: `<try-in-playground eslintrcHash="${convertToPlaygroundHash(
            getEslintrcString(false),
          )}" />`,
          type: 'jsx',
        } as unist.Node,
      );
    } else {
      // For non-extended rules, the code snippet is placed before the first h2
      // (i.e. at the end of the initial explanation)
      const firstH2Index = children.findIndex(
        child => nodeIsHeading(child) && child.depth === 2,
      );

      const getEslintrcString = `{
  "rules": {
    "@typescript-eslint/${file.stem}": "error"
  }
}`;
      children.splice(
        firstH2Index,
        0,
        {
          lang: 'js',
          type: 'code',
          meta: 'title=".eslintrc.cjs"',
          value: `module.exports = ${getEslintrcString};`,
        } as mdast.Code,
        {
          value: `<try-in-playground eslintrcHash="${convertToPlaygroundHash(
            getEslintrcString,
          )}" />`,
          type: 'jsx',
        } as unist.Node,
      );

      optionsH2Index += 2;

      const hasNoConfig = Array.isArray(meta.schema)
        ? meta.schema.length === 0
        : Object.keys(meta.schema).length === 0;
      if (hasNoConfig) {
        children.splice(optionsH2Index + 1, 0, {
          children: [
            {
              type: 'text',
              value: 'This rule is not configurable.',
            },
          ],
          type: 'paragraph',
        } as mdast.Paragraph);
      } else if (!COMPLICATED_RULE_OPTIONS.has(file.stem)) {
        const defaults =
          SPECIAL_CASE_DEFAULTS.get(file.stem) ??
          JSON.stringify(rule.defaultOptions);
        children.splice(
          optionsH2Index + 1,
          0,
          {
            children: [
              {
                type: 'text',
                value: 'This rule accepts the following options',
              } as mdast.Text,
            ],
            type: 'paragraph',
          } as mdast.Paragraph,
          {
            lang: 'ts',
            type: 'code',
            value: [
              compile(rule.meta.schema),
              prettier.format(
                `const defaultOptions: Options = ${defaults};`,
                prettierConfig,
              ),
            ]
              .join(EOL)
              .trim(),
          } as mdast.Code,
        );
      }
    }

    // 5. Add a link to view the rule's source and test code
    children.push(
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

    // 6. Also add a notice about coming from ESLint core for extension rules
    if (meta.docs.extendsBaseRule) {
      children.push({
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
            url: `https://github.com/eslint/eslint/blob/main/docs/src/rules/${
              meta.docs.extendsBaseRule === true
                ? file.stem
                : meta.docs.extendsBaseRule
            }.md`,
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
  };
};

function convertToPlaygroundHash(eslintrc: string): string {
  return lz.compressToEncodedURIComponent(eslintrc);
}

function nodeIsHeading(node: unist.Node): node is mdast.Heading {
  return node.type === 'heading';
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
