import fs from 'fs';
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

type TokenType = marked.Token['type'];

function tokenIs<Type extends TokenType>(
  token: marked.Token,
  type: Type,
): token is marked.Token & { type: Type } {
  return token.type === type;
}

function tokenIsH2(token: marked.Token): token is marked.Tokens.Heading {
  return (
    tokenIs(token, 'heading') &&
    token.depth === 2 &&
    !/[a-z]+: /.test(token.text)
  );
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
    const { description } = rule.meta.docs!;

    describe(`${ruleName}.md`, () => {
      const filePath = path.join(docsRoot, `${ruleName}.md`);
      const tokens = parseMarkdownFile(filePath);

      test(`${ruleName}.md must start with frontmatter description`, () => {
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

      test(`${ruleName}.md must next have a blockquote directing to website`, () => {
        expect(tokens[2]).toMatchObject({
          text: [
            `🛑 This file is source code, not the primary documentation location! 🛑`,
            ``,
            `See **https://typescript-eslint.io/rules/${ruleName}** for documentation.`,
            ``,
          ].join('\n'),
          type: 'blockquote',
        });
      });

      test(`headers must be title-cased`, () => {
        // Get all H2 headers objects as the other levels are variable by design.
        const headers = tokens.filter(tokenIsH2);

        headers.forEach(header =>
          expect(header.text).toBe(titleCase(header.text)),
        );
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
