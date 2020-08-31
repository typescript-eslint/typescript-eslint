import fs from 'fs';
import path from 'path';

import marked from 'marked';
import rules from '../src/rules';

const docsRoot = path.resolve(__dirname, '../docs/rules');
const rulesData = Object.entries(rules);

function createRuleLink(ruleName: string): string {
  return `[\`@typescript-eslint/${ruleName}\`](./docs/rules/${ruleName}.md)`;
}

function parseReadme(): {
  base: marked.Tokens.Table;
  extension: marked.Tokens.Table;
} {
  const readmeRaw = fs.readFileSync(
    path.resolve(__dirname, '../README.md'),
    'utf8',
  );
  const readme = marked.lexer(readmeRaw, {
    gfm: true,
    silent: false,
  });

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

describe('Validating rule docs', () => {
  it('All rules must have a corresponding rule doc', () => {
    const files = fs
      .readdirSync(docsRoot)
      // this rule doc was left behind on purpose for legacy reasons
      .filter(rule => rule !== 'camelcase.md');
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
      expect(tokens[0]).toMatchObject({
        type: 'heading',
        depth: 1,
        text: `${rule.meta.docs?.description} (\`${ruleName}\`)`,
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
        expect(
          rule.meta.docs?.url.endsWith(`rules/${ruleName}.md`),
        ).toBeTruthy();
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

    expect(rulesTables.base.cells.map(row => row[0])).toStrictEqual(
      baseRuleNames,
    );
  });
  it('All non-deprecated extension rules should have a row in the base rules table, and the table should be ordered alphabetically', () => {
    const extensionRuleNames = extensionRules
      .map(([ruleName]) => ruleName)
      .sort()
      .map(createRuleLink);

    expect(rulesTables.extension.cells.map(row => row[0])).toStrictEqual(
      extensionRuleNames,
    );
  });

  for (const [ruleName, rule] of notDeprecated) {
    describe(`Checking rule ${ruleName}`, () => {
      const ruleRow: string[] | undefined = (rule.meta.docs?.extendsBaseRule
        ? rulesTables.extension.cells
        : rulesTables.base.cells
      ).find(row => row[0].includes(`/${ruleName}.md`));
      if (!ruleRow) {
        // rule is in the wrong table, the first two tests will catch this, so no point in creating noise;
        // these tests will ofc fail in that case
        return;
      }

      it('Link column should be correct', () => {
        expect(ruleRow[0]).toEqual(createRuleLink(ruleName));
      });

      it('Description column should be correct', () => {
        expect(ruleRow[1]).toEqual(rule.meta.docs?.description);
      });

      it('Recommended column should be correct', () => {
        expect(ruleRow[2]).toEqual(
          rule.meta.docs?.recommended ? ':heavy_check_mark:' : '',
        );
      });

      it('Fixable column should be correct', () => {
        expect(ruleRow[3]).toEqual(
          rule.meta.fixable !== undefined ? ':wrench:' : '',
        );
      });

      it('Requiring type information column should be correct', () => {
        expect(ruleRow[4]).toEqual(
          rule.meta.docs?.requiresTypeChecking === true
            ? ':thought_balloon:'
            : '',
        );
      });
    });
  }
});
