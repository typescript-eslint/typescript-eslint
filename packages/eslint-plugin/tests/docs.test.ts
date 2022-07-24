import fs from 'fs';
import { JSONSchema4 } from 'json-schema';
import path from 'path';

import { marked } from 'marked';
import rules from '../src/rules';
import { titleCase } from 'title-case';

const docsRoot = path.resolve(__dirname, '../docs/rules');
const rulesData = Object.entries(rules);

function parseMarkdownFile(filePath: string): marked.TokensList {
  const file = fs.readFileSync(filePath, 'utf-8');

  return marked.lexer(file, {
    gfm: true,
    silent: false,
  });
}

function isEmptySchema(schema: JSONSchema4 | JSONSchema4[]): boolean {
  return Array.isArray(schema)
    ? schema.length === 0
    : Object.keys(schema).length === 0;
}

type TokenType = marked.Token['type'];

function tokenAs<Type extends TokenType>(
  token: marked.Token,
  type: Type,
): marked.Token & { type: Type } {
  expect(token.type).toBe(type);
  return token as marked.Token & { type: Type };
}

function tokenIs<Type extends TokenType>(
  token: marked.Token,
  type: Type,
): token is marked.Token & { type: Type } {
  return token.type === type;
}

function tokenIsH2(token: marked.Token): token is marked.Tokens.Heading {
  return tokenIs(token, 'heading') && token.depth === 2;
}

describe('Validating rule docs', () => {
  const ignoredFiles = new Set([
    // this rule doc was left behind on purpose for legacy reasons
    'camelcase.md',
    'README.md',
    'TEMPLATE.md',
  ]);
  it('All rules must have a corresponding rule doc', () => {
    const files = fs
      .readdirSync(docsRoot)
      .filter(rule => !ignoredFiles.has(rule));
    const ruleFiles = Object.keys(rules)
      .map(rule => `${rule}.md`)
      .sort();

    expect(files.sort()).toEqual(ruleFiles);
  });

  for (const [ruleName, rule] of rulesData) {
    describe(ruleName, () => {
      const filePath = path.join(docsRoot, `${ruleName}.md`);

      test(`${ruleName}.md must start with blockquote directing to website`, () => {
        const tokens = parseMarkdownFile(filePath);

        expect(tokens[0]).toMatchObject({
          text: [
            `🛑 This file is source code, not the primary documentation location! 🛑`,
            ``,
            `See **https://typescript-eslint.io/rules/${ruleName}** for documentation.`,
            ``,
          ].join('\n'),
          type: 'blockquote',
        });
      });

      it(`Headers in ${ruleName}.md must be title-cased`, () => {
        const tokens = parseMarkdownFile(filePath);

        // Get all H2 headers objects as the other levels are variable by design.
        const headers = tokens.filter(tokenIsH2);

        headers.forEach(header =>
          expect(header.text).toBe(titleCase(header.text)),
        );
      });

      it(`Options in ${ruleName}.md must match the rule meta`, () => {
        // TODO(#4365): We don't yet enforce formatting for all rules.
        if (
          !isEmptySchema(rule.meta.schema) ||
          !rule.meta.docs?.recommended ||
          rule.meta.docs.extendsBaseRule
        ) {
          return;
        }

        const tokens = parseMarkdownFile(filePath);

        const optionsIndex = tokens.findIndex(
          token => tokenIsH2(token) && token.text === 'Options',
        );
        expect(optionsIndex).toBeGreaterThan(0);

        const codeBlock = tokenAs(tokens[optionsIndex + 1], 'code');
        tokenAs(tokens[optionsIndex + 2], 'space');
        const descriptionBlock = tokenAs(tokens[optionsIndex + 3], 'paragraph');

        expect(codeBlock).toMatchObject({
          lang: 'jsonc',
          text: `
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/${ruleName}": "${
            rule.meta.docs.recommended === 'strict'
              ? 'warn'
              : rule.meta.docs.recommended
          }"
  }
}
          `.trim(),
          type: 'code',
        });
        expect(descriptionBlock).toMatchObject({
          text: 'This rule is not configurable.',
        });
      });
    });
  }
});

describe('Validating rule metadata', () => {
  function requiresFullTypeInformation(content: string): boolean {
    return /getParserServices(\(\s*[^,\s)]+)\s*(,\s*false\s*)?\)/.test(content);
  }

  for (const [ruleName, rule] of rulesData) {
    describe(`${ruleName}`, () => {
      it('`name` field in rule must match the filename', () => {
        // validate if rule name is same as url
        // there is no way to access this field but its used only in generation of docs url
        expect(rule.meta.docs?.url).toBe(
          `https://typescript-eslint.io/rules/${ruleName}`,
        );
      });

      it('`requiresTypeChecking` should be set if the rule uses type information', () => {
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
