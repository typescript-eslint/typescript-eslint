import 'jest-specific-snapshot';

import assert from 'node:assert/strict';

import { parseForESLint } from '@typescript-eslint/parser';
import * as tseslintParser from '@typescript-eslint/parser';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import fs from 'fs';
import { marked } from 'marked';
import type * as mdast from 'mdast';
import type { fromMarkdown as FromMarkdown } from 'mdast-util-from-markdown' with { 'resolution-mode': 'import' };
import type { mdxFromMarkdown as MdxFromMarkdown } from 'mdast-util-mdx' with { 'resolution-mode': 'import' };
import type { mdxjs as Mdxjs } from 'micromark-extension-mdxjs' with { 'resolution-mode': 'import' };
import path from 'path';
import { titleCase } from 'title-case';
import type * as UnistUtilVisit from 'unist-util-visit' with { 'resolution-mode': 'import' };

import rules from '../src/rules';
import { areOptionsValid } from './areOptionsValid';
import { getFixturesRootDir } from './RuleTester';

const docsRoot = path.resolve(__dirname, '../docs/rules');
const rulesData = Object.entries(rules);

interface ParsedMarkdownFile {
  fullText: string;
  tokens: marked.TokensList;
}

function parseMarkdownFile(filePath: string): ParsedMarkdownFile {
  const fullText = fs.readFileSync(filePath, 'utf-8');

  const tokens = marked.lexer(fullText, {
    gfm: true,
    silent: false,
  });

  return { fullText, tokens };
}

type TokenType = marked.Token['type'];

function tokenIs<Type extends TokenType>(
  token: marked.Token,
  type: Type,
): token is marked.Token & { type: Type } {
  return token.type === type;
}

function tokenIsHeading(token: marked.Token): token is marked.Tokens.Heading {
  return tokenIs(token, 'heading');
}

function tokenIsH2(
  token: marked.Token,
): token is marked.Tokens.Heading & { depth: 2 } {
  return (
    tokenIsHeading(token) && token.depth === 2 && !/[a-z]+: /.test(token.text)
  );
}

function renderLintResults(code: string, errors: Linter.LintMessage[]): string {
  const output: string[] = [];
  const lines = code.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    output.push(line);

    for (const error of errors) {
      const startLine = error.line - 1;
      const endLine =
        error.endLine === undefined ? startLine : error.endLine - 1;
      const startColumn = error.column - 1;
      const endColumn =
        error.endColumn === undefined ? startColumn : error.endColumn - 1;
      if (i < startLine || i > endLine) {
        continue;
      }
      if (i === startLine) {
        const squiggle = '~'.repeat(
          startLine === endLine
            ? Math.max(1, endColumn - startColumn)
            : line.length - startColumn,
        );
        const squiggleWithIndent = ' '.repeat(startColumn) + squiggle + ' ';
        const errorMessageIndent = ' '.repeat(squiggleWithIndent.length);
        output.push(
          squiggleWithIndent +
            error.message.split('\n').join('\n' + errorMessageIndent),
        );
      } else if (i === endLine) {
        output.push('~'.repeat(endColumn));
      } else {
        output.push('~'.repeat(line.length));
      }
    }
  }

  return output.join('\n').trim() + '\n';
}

const linter = new Linter({ configType: 'eslintrc' });
linter.defineParser('@typescript-eslint/parser', tseslintParser);

const eslintOutputSnapshotFolder = path.resolve(
  __dirname,
  'docs-eslint-output-snapshots',
);
fs.mkdirSync(eslintOutputSnapshotFolder, { recursive: true });

describe('Validating rule docs', () => {
  let fromMarkdown: typeof FromMarkdown;
  let mdxjs: typeof Mdxjs;
  let mdxFromMarkdown: typeof MdxFromMarkdown;
  let unistUtilVisit: typeof UnistUtilVisit;
  beforeAll(async () => {
    // dynamic import('...') is transpiled to the require('...') call,
    // but all modules imported below are ESM only, so we cannot require() them
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dynamicImport = new Function('module', 'return import(module)');
    ({ fromMarkdown } = await dynamicImport('mdast-util-from-markdown'));
    ({ mdxjs } = await dynamicImport('micromark-extension-mdxjs'));
    ({ mdxFromMarkdown } = await dynamicImport('mdast-util-mdx'));
    unistUtilVisit = await dynamicImport('unist-util-visit');
  });

  const oldStylisticRules = [
    'block-spacing.md',
    'brace-style.md',
    'camelcase.md',
    'comma-dangle.md',
    'comma-spacing.md',
    'func-call-spacing.md',
    'indent.md',
    'key-spacing.md',
    'keyword-spacing.md',
    'lines-around-comment.md',
    'lines-between-class-members.md',
    'member-delimiter-style.md',
    'no-extra-parens.md',
    'no-extra-semi.md',
    'object-curly-spacing.md',
    'padding-line-between-statements.md',
    'quotes.md',
    'semi.md',
    'space-before-blocks.md',
    'space-before-function-paren.md',
    'space-infix-ops.md',
    'type-annotation-spacing.md',
  ];

  const ignoredFiles = new Set([
    'README.md',
    'TEMPLATE.md',
    // These rule docs were left behind on purpose for legacy reasons. See the
    // comments in the files for more information.
    'no-duplicate-imports.mdx',
    'no-parameter-properties.mdx',
    'no-useless-template-literals.mdx',
    'sort-type-union-intersection-members.mdx',
    ...oldStylisticRules,
  ]);

  const rulesWithComplexOptions = new Set(['array-type', 'member-ordering']);

  // TODO: whittle this list down to as few as possible
  const rulesWithComplexOptionHeadings = new Set([
    'ban-ts-comment',
    'ban-types',
    'consistent-type-exports',
    'consistent-type-imports',
    'explicit-function-return-type',
    'explicit-member-accessibility',
    'explicit-module-boundary-types',
    'no-base-to-string',
    'no-confusing-void-expression',
    'no-duplicate-type-constituents',
    'no-empty-interface',
    'no-empty-object-type',
    'no-explicit-any',
    'no-floating-promises',
    'no-inferrable-types',
    'no-invalid-void-type',
    'no-meaningless-void-operator',
    'no-misused-promises',
    'no-type-alias',
    'no-unnecessary-condition',
    'no-unnecessary-type-assertion',
    'parameter-properties',
    'prefer-nullish-coalescing',
    'prefer-optional-chain',
    'prefer-string-starts-ends-with',
    'promise-function-async',
    'restrict-template-expressions',
    'strict-boolean-expressions',
    'switch-exhaustiveness-check',
    'switch-exhaustiveness-check',
    'unbound-method',
  ]);

  it('All rules must have a corresponding rule doc', () => {
    const files = fs
      .readdirSync(docsRoot)
      .filter(rule => !ignoredFiles.has(rule));
    const ruleFiles = Object.keys(rules)
      .map(rule => `${rule}.mdx`)
      .sort();

    expect(files.sort()).toEqual(ruleFiles);
  });

  for (const [ruleName, rule] of rulesData) {
    const { description } = rule.meta.docs!;

    describe(`${ruleName}.mdx`, () => {
      const filePath = path.join(docsRoot, `${ruleName}.mdx`);
      const { fullText, tokens } = parseMarkdownFile(filePath);

      test(`${ruleName}.mdx must start with frontmatter description`, () => {
        expect(tokens[0]).toMatchObject({
          raw: '---\n',
          type: 'hr',
        });
        expect(tokens[1]).toMatchObject({
          text: description.includes("'")
            ? `description: "${description}."`
            : `description: '${description}.'`,
          depth: 2,
          type: 'heading',
        });
      });

      test(`${ruleName}.mdx must next have a blockquote directing to website`, () => {
        expect(tokens[4]).toMatchObject({
          text: [
            `🛑 This file is source code, not the primary documentation location! 🛑`,
            ``,
            `See **https://typescript-eslint.io/rules/${ruleName}** for documentation.`,
            ``,
          ].join('\n'),
          type: 'blockquote',
        });
      });

      test(`headings must be title-cased`, () => {
        // Get all H2 headings objects as the other levels are variable by design.
        const headings = tokens.filter(tokenIsH2);

        headings.forEach(heading =>
          expect(heading.text).toBe(titleCase(heading.text)),
        );
      });

      const headings = tokens.filter(tokenIsHeading);

      const requiredHeadings = ['When Not To Use It'];

      const importantHeadings = new Set([
        ...requiredHeadings,
        'How to Use',
        'Options',
        'Related To',
        'When Not To Use It',
      ]);

      test('important headings must be h2s', () => {
        for (const heading of headings) {
          if (importantHeadings.has(heading.raw.replace(/#/g, '').trim())) {
            expect(heading.depth).toBe(2);
          }
        }
      });

      if (!rules[ruleName as keyof typeof rules].meta.docs?.extendsBaseRule) {
        test('must include required headings', () => {
          const headingTexts = new Set(
            tokens.filter(tokenIsH2).map(token => token.text),
          );

          for (const requiredHeading of requiredHeadings) {
            const omissionComment = `{/* Intentionally Omitted: ${requiredHeading} */}`;

            if (
              !headingTexts.has(requiredHeading) &&
              !fullText.includes(omissionComment)
            ) {
              throw new Error(
                `Expected a '${requiredHeading}' heading or comment like ${omissionComment}.`,
              );
            }
          }
        });
      }

      const { schema } = rule.meta;
      if (
        !rulesWithComplexOptions.has(ruleName) &&
        Array.isArray(schema) &&
        !rule.meta.docs?.extendsBaseRule
      ) {
        describe('rule options', () => {
          const headingsAfterOptions = headings.slice(
            headings.findIndex(header => header.text === 'Options'),
          );

          for (const schemaItem of schema) {
            if (schemaItem.type === 'object') {
              for (const property of Object.keys(
                schemaItem.properties as object,
              )) {
                test(property, () => {
                  const correspondingHeadingIndex =
                    headingsAfterOptions.findIndex(heading =>
                      heading.text.includes(`\`${property}\``),
                    );

                  if (correspondingHeadingIndex === -1) {
                    throw new Error(
                      `At least one header should include \`${property}\`.`,
                    );
                  }

                  if (rulesWithComplexOptionHeadings.has(ruleName)) {
                    return;
                  }

                  const relevantChildren = tokens.slice(
                    tokens.indexOf(
                      headingsAfterOptions[correspondingHeadingIndex],
                    ),
                    tokens.indexOf(
                      headingsAfterOptions[correspondingHeadingIndex + 1],
                    ),
                  );

                  for (const rawTab of [
                    `<TabItem value="✅ Correct">`,
                    `<TabItem value="❌ Incorrect">`,
                  ]) {
                    if (
                      !relevantChildren.some(
                        child =>
                          child.type === 'html' && child.raw.includes(rawTab),
                      )
                    ) {
                      throw new Error(`Missing option example tab: ${rawTab}`);
                    }
                  }
                });
              }
            }
          }
        });
      }

      test('must include only valid code samples', () => {
        for (const token of tokens) {
          if (token.type !== 'code') {
            continue;
          }

          const lang = token.lang?.trim();
          if (!lang || !/^tsx?\b/i.test(lang)) {
            continue;
          }

          try {
            parseForESLint(token.text, {
              ecmaFeatures: {
                jsx: /^tsx\b/i.test(lang),
              },
              ecmaVersion: 'latest',
              sourceType: 'module',
              range: true,
            });
          } catch {
            throw new Error(`Parsing error:\n\n${token.text}`);
          }
        }
      });

      test('code examples ESLint output', () => {
        // TypeScript can't infer type arguments unless we provide them explicitly
        linter.defineRule<
          keyof (typeof rule)['meta']['messages'],
          (typeof rule)['defaultOptions']
        >(ruleName, rule);

        const tree = fromMarkdown(fullText, {
          extensions: [mdxjs()],
          mdastExtensions: [mdxFromMarkdown()],
        });

        unistUtilVisit.visit(tree, node => {
          if (node.type === 'mdxJsxFlowElement') {
            if (node.name !== 'TabItem') {
              return unistUtilVisit.CONTINUE;
            }

            unistUtilVisit.visit(node, 'code', code => {
              const valueAttr = node.attributes.find(
                attr =>
                  attr.type === 'mdxJsxAttribute' && attr.name === 'value',
              );
              lintCodeBlock(
                code,
                valueAttr && typeof valueAttr.value === 'string'
                  ? valueAttr.value.startsWith('❌ Incorrect') ||
                      (valueAttr.value.startsWith('✅ Correct')
                        ? false
                        : 'skip-check')
                  : 'skip-check',
              );
            });

            return unistUtilVisit.SKIP;
          }

          if (node.type === 'code') {
            if (node.meta?.includes('showPlaygroundButton')) {
              lintCodeBlock(node, 'skip-check');
            }

            return unistUtilVisit.SKIP;
          }

          return unistUtilVisit.CONTINUE;
        });

        function lintCodeBlock(
          token: mdast.Code,
          shouldContainLintErrors: boolean | 'skip-check',
        ): void {
          const lang = token.lang?.trim();
          if (!lang || !/^tsx?\b/i.test(lang)) {
            return;
          }

          const optionRegex = /option='(?<option>.*?)'/;

          const option = token.meta?.match(optionRegex)?.groups?.option;
          let ruleConfig: Linter.RuleEntry;
          if (option) {
            const [, ...options] = (ruleConfig = JSON.parse(
              `["error", ${option}]`,
            ));

            if (!areOptionsValid(rule, options)) {
              throw new Error(
                `Options failed validation against rule's schema - ${JSON.stringify(options)}`,
              );
            }
          } else {
            ruleConfig = 'error';
          }
          const rootPath = getFixturesRootDir();

          const messages = linter.verify(
            token.value,
            {
              parser: '@typescript-eslint/parser',
              parserOptions: {
                disallowAutomaticSingleRunInference: true,
                tsconfigRootDir: rootPath,
                project: './tsconfig.json',
              },
              rules: {
                [ruleName]: ruleConfig,
              },
            },
            /^tsx\b/i.test(lang) ? 'react.tsx' : 'file.ts',
          );

          const testCaption: string[] = [];
          if (shouldContainLintErrors !== 'skip-check') {
            if (shouldContainLintErrors) {
              testCaption.push('Incorrect');
              if (token.meta?.includes('skipValidation')) {
                assert.ok(
                  messages.length === 0,
                  'Expected not to contain lint errors (with skipValidation):\n' +
                    token.value,
                );
              } else {
                assert.ok(
                  messages.length > 0,
                  'Expected to contain at least 1 lint error:\n' + token.value,
                );
              }
            } else {
              testCaption.push('Correct');
              if (token.meta?.includes('skipValidation')) {
                assert.ok(
                  messages.length > 0,
                  'Expected to contain at least 1 lint error (with skipValidation):\n' +
                    token.value,
                );
              } else {
                assert.ok(
                  messages.length === 0,
                  'Expected not to contain lint errors:\n' + token.value,
                );
              }
            }
          }
          if (option) {
            testCaption.push(`Options: ${option}`);
          }

          expect(
            testCaption.filter(Boolean).join('\n') +
              '\n\n' +
              renderLintResults(token.value, messages),
          ).toMatchSpecificSnapshot(
            path.join(eslintOutputSnapshotFolder, `${ruleName}.shot`),
          );
        }
      });
    });
  }
});

test('There should be no obsolete ESLint output snapshots', () => {
  const files = fs.readdirSync(eslintOutputSnapshotFolder);
  const names = new Set(Object.keys(rules).map(k => `${k}.shot`));

  for (const file of files) {
    expect(names).toContain(file);
  }
});

describe('Validating rule metadata', () => {
  const rulesThatRequireTypeInformationInAWayThatsHardToDetect = new Set([
    // the core rule file doesn't use type information, instead it's used in `src/rules/naming-convention-utils/validator.ts`
    'naming-convention',
  ]);
  function requiresFullTypeInformation(content: string): boolean {
    return /getParserServices(\(\s*[^,\s)]+)\s*(,\s*false\s*)?\)/.test(content);
  }

  for (const [ruleName, rule] of rulesData) {
    describe(ruleName, () => {
      it('`name` field in rule must match the filename', () => {
        // validate if rule name is same as url
        // there is no way to access this field but it's used only in generation of docs url
        expect(rule.meta.docs?.url).toBe(
          `https://typescript-eslint.io/rules/${ruleName}`,
        );
      });

      it('`requiresTypeChecking` should be set if the rule uses type information', () => {
        if (
          rulesThatRequireTypeInformationInAWayThatsHardToDetect.has(ruleName)
        ) {
          expect(true).toEqual(rule.meta.docs?.requiresTypeChecking ?? false);
          return;
        }

        // quick-and-dirty check to see if it uses parserServices
        // not perfect but should be good enough
        const ruleFileContents = fs.readFileSync(
          path.resolve(__dirname, `../src/rules/${ruleName}.ts`),
          'utf-8',
        );

        expect(requiresFullTypeInformation(ruleFileContents)).toEqual(
          rule.meta.docs?.requiresTypeChecking ?? false,
        );
      });
    });
  }
});
