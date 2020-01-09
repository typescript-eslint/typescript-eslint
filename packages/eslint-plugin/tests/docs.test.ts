import fs from 'fs';
import path from 'path';

import marked from 'marked';
import rules from '../src/rules';

const docsRoot = path.resolve(__dirname, '../docs/rules');
const rulesData = Object.entries(rules);

function createRuleLink(ruleName: string): string {
  return `[\`@typescript-eslint/${ruleName}\`](./docs/rules/${ruleName}.md)`;
}

function parseReadme(): marked.Tokens.Table {
  const readmeRaw = fs.readFileSync(
    path.resolve(__dirname, '../README.md'),
    'utf8',
  );
  const readme = marked.lexer(readmeRaw, {
    gfm: true,
    silent: false,
  });

  // find the table
  const rulesTable = readme.find(
    (token): token is marked.Tokens.Table => token.type === 'table',
  );
  if (!rulesTable) {
    throw Error('Could not find the rules table in README.md');
  }

  return rulesTable;
}

describe('Validating rule docs', () => {
  it('All rules must have a corresponding rule doc', () => {
    const files = fs.readdirSync(docsRoot);
    const ruleFiles = Object.keys(rules)
      .map(rule => `${rule}.md`)
      .sort();

    expect(files.sort()).toEqual(ruleFiles);
  });

  for (const [ruleName, rule] of rulesData) {
    const filePath = path.join(docsRoot, `${ruleName}.md`);
    it(`Description of ${ruleName}.md must match`, () => {
      // validate if description of rule is same as in docs
      const file = fs.readFileSync(filePath, 'utf-8');
      const tokens = marked.lexer(file, {
        gfm: true,
        silent: false,
      });

      // Rule title not found.
      // Rule title does not match the rule metadata.
      expect(tokens[0]).toEqual({
        type: 'heading',
        depth: 1,
        text: `${rule.meta.docs.description} (\`${ruleName}\`)`,
      });
    });
  }
});

describe('Validating rule metadata', () => {
  for (const [ruleName, rule] of rulesData) {
    describe(`${ruleName}`, () => {
      it('`name` field in rule must match the filename', () => {
        // validate if rule name is same as url
        // there is no way to access this field but its used only in generation of docs url
        expect(
          rule.meta.docs.url.endsWith(`rules/${ruleName}.md`),
        ).toBeTruthy();
      });

      it('`requiresTypeChecking` should be set if the rule uses type information', () => {
        // quick-and-dirty check to see if it uses parserServices
        // not perfect but should be good enough
        const ruleFileContents = fs.readFileSync(
          path.resolve(__dirname, `../src/rules/${ruleName}.ts`),
        );

        expect(ruleFileContents.includes('getParserServices')).toEqual(
          rule.meta.docs.requiresTypeChecking ?? false,
        );
      });
    });
  }
});

describe('Validating README.md', () => {
  const rulesTable = parseReadme().cells;
  const notDeprecated = rulesData.filter(
    ([, rule]) => rule.meta.deprecated !== true,
  );

  it('All non-deprecated rules should have a row in the table, and the table should be ordered alphabetically', () => {
    const ruleNames = notDeprecated
      .map(([ruleName]) => ruleName)
      .sort()
      .map(createRuleLink);

    expect(rulesTable.map(row => row[0])).toStrictEqual(ruleNames);
  });

  for (const [ruleName, rule] of notDeprecated) {
    describe(`Checking rule ${ruleName}`, () => {
      const ruleRow =
        rulesTable.find(row => row[0].includes(`/${ruleName}.md`)) ?? [];

      it('Link column should be correct', () => {
        expect(ruleRow[0]).toEqual(createRuleLink(ruleName));
      });

      it('Description column should be correct', () => {
        expect(ruleRow[1]).toEqual(rule.meta.docs.description);
      });

      it('Recommended column should be correct', () => {
        expect(ruleRow[2]).toEqual(
          rule.meta.docs.recommended ? ':heavy_check_mark:' : '',
        );
      });

      it('Fixable column should be correct', () => {
        expect(ruleRow[3]).toEqual(
          rule.meta.fixable !== undefined ? ':wrench:' : '',
        );
      });

      it('Requiring type information column should be correct', () => {
        expect(ruleRow[4]).toEqual(
          rule.meta.docs.requiresTypeChecking === true
            ? ':thought_balloon:'
            : '',
        );
      });
    });
  }
});
