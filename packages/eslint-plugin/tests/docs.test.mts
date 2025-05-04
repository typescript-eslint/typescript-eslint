import type * as mdast from 'mdast';

import * as tseslintParser from '@typescript-eslint/parser';
import { parseForESLint } from '@typescript-eslint/parser';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { marked } from 'marked';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { titleCase } from 'title-case';
import * as unistUtilVisit from 'unist-util-visit';

import rules from '../src/rules/index.js';
import { areOptionsValid } from './areOptionsValid.js';
import { getFixturesRootDir } from './RuleTester.js';

const docsRoot = path.join(import.meta.dirname, '..', 'docs', 'rules');

const FIXTURES_DIR = getFixturesRootDir();

const rulesData = Object.entries(rules);

interface ParsedMarkdownFile {
  fullText: string;
  tokens: marked.TokensList;
}

async function parseMarkdownFile(
  filePath: string,
): Promise<ParsedMarkdownFile> {
  const fullText = await fs.readFile(filePath, { encoding: 'utf-8' });

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
): token is { type: Type } & marked.Token {
  return token.type === type;
}

function tokenIsHeading(token: marked.Token): token is marked.Tokens.Heading {
  return tokenIs(token, 'heading');
}

function tokenIsH2(
  token: marked.Token,
): token is { depth: 2 } & marked.Tokens.Heading {
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
      const endLine = error.endLine == null ? startLine : error.endLine - 1;
      const startColumn = error.column - 1;
      const endColumn =
        error.endColumn == null ? startColumn : error.endColumn - 1;
      if (i < startLine || i > endLine) {
        continue;
      }
      if (i === startLine) {
        const squiggle = '~'.repeat(
          startLine === endLine
            ? Math.max(1, endColumn - startColumn)
            : line.length - startColumn,
        );
        const squiggleWithIndent = `${' '.repeat(startColumn)}${squiggle} `;
        const errorMessageIndent = ' '.repeat(squiggleWithIndent.length);
        output.push(
          squiggleWithIndent +
            error.message.replaceAll('\n', `\n${errorMessageIndent}`),
        );
      } else if (i === endLine) {
        output.push('~'.repeat(endColumn));
      } else {
        output.push('~'.repeat(line.length));
      }
    }
  }

  return `${output.join('\n').trim()}\n`;
}

const linter = new Linter({ configType: 'eslintrc' });
linter.defineParser('@typescript-eslint/parser', tseslintParser);

const eslintOutputSnapshotFolder = path.join(
  import.meta.dirname,
  'docs-eslint-output-snapshots',
);

describe('Validating rule docs', () => {
  beforeAll(async () => {
    await fs.mkdir(eslintOutputSnapshotFolder, { recursive: true });
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
    'shared',
    'TEMPLATE.md',
    // These rule docs were left behind on purpose for legacy reasons. See the
    // comments in the files for more information.
    'ban-types.md',
    'no-duplicate-imports.mdx',
    'no-parameter-properties.mdx',
    'no-useless-template-literals.mdx',
    'sort-type-union-intersection-members.mdx',
    ...oldStylisticRules,
  ]);

  const rulesWithComplexOptions = new Set([
    'array-type',
    'member-ordering',
    'no-restricted-types',
  ]);

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
    'no-unnecessary-boolean-literal-compare',
  ]);

  it('All rules must have a corresponding rule doc', async () => {
    const files = (await fs.readdir(docsRoot, { encoding: 'utf-8' }))
      .filter(rule => !ignoredFiles.has(rule))
      .sort();
    const ruleFiles = rulesData.map(([rule]) => `${rule}.mdx`).sort();

    expect(files).toStrictEqual(ruleFiles);
  });

  describe.for(rulesData)('%s.mdx', async ([ruleName, rule]) => {
    assert.isDefined(rule.meta.docs);

    const { description } = rule.meta.docs;

    const filePath = path.join(docsRoot, `${ruleName}.mdx`);
    const { fullText, tokens } = await parseMarkdownFile(filePath);

    test(`${ruleName}.mdx must start with frontmatter description`, () => {
      expect(tokens[0]).toMatchObject({
        raw: '---\n',
        type: 'hr',
      });
      expect(tokens[1]).toMatchObject({
        depth: 2,
        text: description.includes("'")
          ? `description: "${description}."`
          : `description: '${description}.'`,
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

    // Get all H2 headings objects as the other levels are variable by design.
    const h2headings = tokens.filter(tokenIsH2);

    describe.runIf(h2headings.length > 0)(
      `headings must be title-cased`,
      () => {
        const testCases = h2headings.map(heading =>
          heading.text.replaceAll(/`[^`]*`/g, ''),
        );

        test.for(testCases)('$text', (nonCodeText, { expect }) => {
          expect(nonCodeText).toBe(titleCase(nonCodeText));
        });
      },
    );

    const headings = tokens.filter(tokenIsHeading);

    const requiredHeadings = ['When Not To Use It'];

    const importantHeadings = new Set([
      'How to Use',
      'Options',
      'Related To',
      'When Not To Use It',
      ...requiredHeadings,
    ]);

    const testCases = headings.filter(heading =>
      importantHeadings.has(heading.raw.replaceAll('#', '').trim()),
    );

    describe.runIf(testCases.length > 0)(
      'important headings must be h2s',
      () => {
        test.for(testCases)('$text', (heading, { expect }) => {
          expect(heading.depth).toBe(2);
        });
      },
    );

    describe.runIf(
      !rules[ruleName as keyof typeof rules].meta.docs?.extendsBaseRule,
    )('must include required headings', () => {
      test.for(requiredHeadings)('%s', (requiredHeading, { expect }) => {
        const headingTexts = new Set(
          tokens.filter(tokenIsH2).map(token => token.text),
        );

        const omissionComment = `{/* Intentionally Omitted: ${requiredHeading} */}`;

        expect(
          !headingTexts.has(requiredHeading) &&
            !fullText.includes(omissionComment),
        ).toBe(false);
      });
    });

    const { schema } = rule.meta;
    if (
      !rulesWithComplexOptions.has(ruleName) &&
      Array.isArray(schema) &&
      !rule.meta.docs.extendsBaseRule
    ) {
      const testCases = schema
        .filter(schemaItem => schemaItem.type === 'object')
        .flatMap(schemaItem => Object.keys(schemaItem.properties as object));

      describe.runIf(testCases.length > 0)('rule options', () => {
        const headingsAfterOptions = headings.slice(
          headings.findIndex(header => header.text === 'Options'),
        );

        it.for(testCases)('%s', (property, { expect }) => {
          const correspondingHeadingIndex = headingsAfterOptions.findIndex(
            heading => heading.text.includes(`\`${property}\``),
          );

          expect(correspondingHeadingIndex).not.toBe(-1);

          if (rulesWithComplexOptionHeadings.has(ruleName)) {
            return;
          }

          const relevantChildren = tokens.slice(
            tokens.indexOf(headingsAfterOptions[correspondingHeadingIndex]),
            tokens.indexOf(headingsAfterOptions[correspondingHeadingIndex + 1]),
          );

          for (const rawTab of [
            `<TabItem value="✅ Correct">`,
            `<TabItem value="❌ Incorrect">`,
          ]) {
            expect(
              relevantChildren.some(
                child => child.type === 'html' && child.raw.includes(rawTab),
              ),
            ).toBe(true);
          }
        });
      });
    }

    const codeTokens = tokens.filter(token => tokenIs(token, 'code'));

    describe.runIf(codeTokens.length > 0)(
      'must include only valid code samples',
      () => {
        test.for(codeTokens)('$text', (token, { expect }) => {
          const lang = token.lang?.trim();
          if (!lang || !/^tsx?\b/i.test(lang)) {
            return;
          }

          expect(() =>
            parseForESLint(token.text, {
              ecmaFeatures: {
                jsx: /^tsx\b/i.test(lang),
              },
              ecmaVersion: 'latest',
              range: true,
              sourceType: 'module',
            }),
          ).not.toThrow();
        });
      },
    );

    test('code examples ESLint output', async ({ expect }) => {
      // TypeScript can't infer type arguments unless we provide them explicitly
      linter.defineRule<
        keyof (typeof rule)['meta']['messages'],
        (typeof rule)['defaultOptions']
      >(ruleName, rule);

      const tree = fromMarkdown(fullText, {
        extensions: [mdxjs()],
        mdastExtensions: [mdxFromMarkdown()],
      });

      const snapshotContents: string[] = [];

      unistUtilVisit.visit(tree, node => {
        if (node.type === 'mdxJsxFlowElement') {
          if (node.name !== 'TabItem') {
            return unistUtilVisit.CONTINUE;
          }

          unistUtilVisit.visit(node, 'code', code => {
            const valueAttr = node.attributes.find(
              attr => attr.type === 'mdxJsxAttribute' && attr.name === 'value',
            );

            const snapshotContent = lintCodeBlock(
              code,
              valueAttr && typeof valueAttr.value === 'string'
                ? valueAttr.value.startsWith('❌ Incorrect') ||
                    (valueAttr.value.startsWith('✅ Correct')
                      ? false
                      : 'skip-check')
                : 'skip-check',
            );

            if (snapshotContent) {
              snapshotContents.push(snapshotContent);
            }
          });

          return unistUtilVisit.SKIP;
        }

        if (node.type === 'code') {
          if (node.meta?.includes('showPlaygroundButton')) {
            const snapshotContent = lintCodeBlock(node, 'skip-check');

            if (snapshotContent) {
              snapshotContents.push(snapshotContent);
            }
          }

          return unistUtilVisit.SKIP;
        }

        return unistUtilVisit.CONTINUE;
      });

      if (snapshotContents.length === 0) {
        return;
      }

      await expect(snapshotContents.join('\n')).toMatchFileSnapshot(
        path.join(eslintOutputSnapshotFolder, `${ruleName}.shot`),
      );

      function lintCodeBlock(
        token: mdast.Code,
        shouldContainLintErrors: boolean | 'skip-check',
      ): string | undefined {
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

          expect(areOptionsValid(rule, options)).toBe(true);
        } else {
          ruleConfig = 'error';
        }

        const messages = linter.verify(
          token.value,
          {
            parser: '@typescript-eslint/parser',
            parserOptions: {
              disallowAutomaticSingleRunInference: true,
              project: './tsconfig.json',
              tsconfigRootDir: FIXTURES_DIR,
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
              assert.isEmpty(
                messages,
                `Expected not to contain lint errors (with skipValidation):
${token.value}`,
              );
            } else {
              assert.isNotEmpty(
                messages,
                `Expected to contain at least 1 lint error:\n${token.value}`,
              );
            }
          } else {
            testCaption.push('Correct');
            if (token.meta?.includes('skipValidation')) {
              assert.isNotEmpty(
                messages,
                `Expected to contain at least 1 lint error (with skipValidation):\n${
                  token.value
                }`,
              );
            } else {
              assert.isEmpty(
                messages,
                `Expected not to contain lint errors:\n${token.value}`,
              );
            }
          }
        }
        if (option) {
          testCaption.push(`Options: ${option}`);
        }

        return `${testCaption.filter(Boolean).join('\n')}\n\n${renderLintResults(
          token.value,
          messages,
        )}`;
      }
    });
  });
});

describe('There should be no obsolete ESLint output snapshots', async () => {
  const files = await fs.readdir(eslintOutputSnapshotFolder, {
    encoding: 'utf-8',
  });
  const names = new Set(rulesData.map(([k]) => `${k}.shot`));

  test.for(files)('%s', (file, { expect }) => {
    expect(names).toContain(file);
  });
});

describe('Validating rule metadata', () => {
  const rulesThatRequireTypeInformationInAWayThatsHardToDetect = new Set([
    // the core rule file doesn't use type information, instead it's used in `src/rules/naming-convention-utils/validator.ts`
    'naming-convention',
  ]);
  function requiresFullTypeInformation(content: string): boolean {
    return /getParserServices(\(\s*[^,\s)]+)\s*(,\s*false\s*)?\)/.test(content);
  }

  describe.for(rulesData)('%s', ([ruleName, rule]) => {
    it('`name` field in rule must match the filename', () => {
      // validate if rule name is same as url
      // there is no way to access this field but it's used only in generation of docs url
      expect(rule.meta.docs?.url).toBe(
        `https://typescript-eslint.io/rules/${ruleName}`,
      );
    });

    it('`requiresTypeChecking` should be set if the rule uses type information', async () => {
      if (
        rulesThatRequireTypeInformationInAWayThatsHardToDetect.has(ruleName)
      ) {
        expect(true).toBe(rule.meta.docs?.requiresTypeChecking ?? false);
        return;
      }

      // quick-and-dirty check to see if it uses parserServices
      // not perfect but should be good enough
      const ruleFileContents = await fs.readFile(
        path.join(import.meta.dirname, '..', 'src', 'rules', `${ruleName}.ts`),
        { encoding: 'utf-8' },
      );

      expect(requiresFullTypeInformation(ruleFileContents)).toBe(
        rule.meta.docs?.requiresTypeChecking ?? false,
      );
    });
  });
});
