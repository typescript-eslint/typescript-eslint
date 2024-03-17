import { parseForESLint } from '@typescript-eslint/parser';
import fs from 'fs';
import { marked } from 'marked';
import path from 'path';
import { titleCase } from 'title-case';

import rules from '../src/rules';

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

describe('Validating rule docs', () => {
  const ignoredFiles = new Set([
    'README.md',
    'TEMPLATE.md',
    // These rule docs were left behind on purpose for legacy reasons. See the
    // comments in the files for more information.
    'camelcase.md',
    'no-duplicate-imports.mdx',
    'no-parameter-properties.mdx',
  ]);

  const rulesWithComplexOptions = new Set(['array-type', 'member-ordering']);

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
        !rule.meta.docs?.extendsBaseRule &&
        rule.meta.type !== 'layout'
      ) {
        test('each rule option should be mentioned in a heading', () => {
          const headingTextAfterOptions = headings
            .slice(headings.findIndex(header => header.text === 'Options'))
            .map(header => header.text)
            .join('\n');

          for (const schemaItem of schema) {
            if (schemaItem.type === 'object') {
              for (const property of Object.keys(
                schemaItem.properties as object,
              )) {
                if (!headingTextAfterOptions.includes(`\`${property}\``)) {
                  throw new Error(
                    `At least one header should include \`${property}\`.`,
                  );
                }
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
    });
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
        // there is no way to access this field but its used only in generation of docs url
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
