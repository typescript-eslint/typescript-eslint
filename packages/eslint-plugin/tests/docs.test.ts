import { TSESLint } from '@typescript-eslint/utils';
import fs from 'fs';
import { JSONSchema4 } from 'json-schema';
import path from 'path';

import marked from 'marked';
import rules from '../src/rules';
import { titleCase } from 'title-case';

const docsRoot = path.resolve(__dirname, '../docs/rules');
const rulesData = Object.entries(rules);

function createRuleLink(ruleName: string): string {
  return `[\`@typescript-eslint/${ruleName}\`](./docs/rules/${ruleName}.md)`;
}

function parseMarkdownFile(filePath: string): marked.TokensList {
  const file = fs.readFileSync(filePath, 'utf-8');

  return marked.lexer(file, {
    gfm: true,
    silent: false,
  });
}

function parseReadme(): {
  base: marked.Tokens.Table;
  extension: marked.Tokens.Table;
} {
  const readme = parseMarkdownFile(path.resolve(__dirname, '../README.md'));

  // find the table
  const rulesTables = readme.filter(
    (token): token is marked.Tokens.Table =>
      'type' in token && token.type === 'table',
  );
  if (rulesTables.length !== 2) {
    throw Error('Could not find both rules tables in README.md');
  }

  return {
    base: rulesTables[0],
    extension: rulesTables[1],
  };
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

function tokenIsH1(token: marked.Token): token is marked.Tokens.Heading {
  return tokenIs(token, 'heading') && token.depth === 1;
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

      it(`First header in ${ruleName}.md must be the name of the rule`, () => {
        const tokens = parseMarkdownFile(filePath);

        const header = tokens.find(tokenIsH1)!;

        expect(header.text).toBe(`\`${ruleName}\``);
      });

      it(`Description of ${ruleName}.md must match`, () => {
        // validate if description of rule is same as in docs
        const tokens = parseMarkdownFile(filePath);

        // Rule title not found.
        // Rule title does not match the rule metadata.
        expect(tokens[1]).toMatchObject({
          type: 'paragraph',
          text: `${rule.meta.docs?.description}.`,
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

      it(`Attributes in ${ruleName}.md must match the metadata`, () => {
        const tokens = parseMarkdownFile(filePath);

        // Verify attributes header exists
        const attributesHeaderIndex = tokens.findIndex(
          token => tokenIs(token, 'heading') && token.text === 'Attributes',
        );
        expect(attributesHeaderIndex).toBeGreaterThan(-1);

        // Verify attributes content...
        const attributesList = tokenAs(
          tokens[attributesHeaderIndex + 1],
          'list',
        );
        // ...starting with configs
        const configs = attributesList.items[0];
        expect(configs.text).toMatch(/Configs:\n/);
        const configsList = tokenAs(configs.tokens[1], 'list');
        const recommended = configsList.items[0];
        expect(shouldBeRecommended(rule.meta.docs)).toBe(recommended.checked);
        const strict = configsList.items[1];
        expect(shouldBeStrict(rule.meta.docs)).toBe(strict.checked);

        // Verify other attributes
        const fixable = attributesList.items[1];
        expect(rule.meta.fixable !== undefined).toBe(fixable.checked);
        const requiresTypeChecking = attributesList.items[2];
        expect(rule.meta.docs?.requiresTypeChecking === true).toBe(
          requiresTypeChecking.checked,
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

describe('Validating README.md', () => {
  const rulesTables = parseReadme();
  const notDeprecated = rulesData.filter(([, rule]) => !rule.meta.deprecated);
  const baseRules = notDeprecated.filter(
    ([, rule]) => !rule.meta.docs?.extendsBaseRule,
  );
  const extensionRules = notDeprecated.filter(
    ([, rule]) => rule.meta.docs?.extendsBaseRule,
  );

  it('All non-deprecated base rules should have a row in the base rules table, and the table should be ordered alphabetically', () => {
    const baseRuleNames = baseRules
      .map(([ruleName]) => ruleName)
      .sort()
      .map(createRuleLink);

    expect(rulesTables.base.rows.map(row => row[0].text)).toStrictEqual(
      baseRuleNames,
    );
  });
  it('All non-deprecated extension rules should have a row in the base rules table, and the table should be ordered alphabetically', () => {
    const extensionRuleNames = extensionRules
      .map(([ruleName]) => ruleName)
      .sort()
      .map(createRuleLink);

    expect(rulesTables.extension.rows.map(row => row[0].text)).toStrictEqual(
      extensionRuleNames,
    );
  });

  for (const [ruleName, rule] of notDeprecated) {
    describe(`Checking rule ${ruleName}`, () => {
      const ruleRow: string[] | undefined = (
        rule.meta.docs?.extendsBaseRule
          ? rulesTables.extension.rows
          : rulesTables.base.rows
      )
        .find(row => row[0].text.includes(`/${ruleName}.md`))
        ?.map(cell => cell.text);
      if (!ruleRow) {
        // rule is in the wrong table, the first two tests will catch this, so no point in creating noise;
        // these tests will ofc fail in that case
        return;
      }

      it('Link column should be correct', () => {
        expect(ruleRow[0]).toBe(createRuleLink(ruleName));
      });

      it('Description column should be correct', () => {
        expect(ruleRow[1]).toBe(rule.meta.docs?.description);
      });

      it('Recommended column should be correct', () => {
        expect(ruleRow[2]).toBe(
          rule.meta.docs?.recommended === 'strict'
            ? ':heavy_check_mark:'
            : rule.meta.docs?.recommended
            ? ':white_check_mark:'
            : '',
        );
      });

      it('Fixable column should be correct', () => {
        expect(ruleRow[3]).toBe(
          rule.meta.fixable !== undefined ? ':wrench:' : '',
        );
      });

      it('Requiring type information column should be correct', () => {
        expect(ruleRow[4]).toBe(
          rule.meta.docs?.requiresTypeChecking === true
            ? ':thought_balloon:'
            : '',
        );
      });
    });
  }
});

function shouldBeRecommended(
  docs: TSESLint.RuleMetaDataDocs | undefined,
): boolean {
  return docs?.recommended !== false && docs?.recommended !== 'strict';
}

function shouldBeStrict(docs: TSESLint.RuleMetaDataDocs | undefined): boolean {
  return docs?.recommended !== false;
}
