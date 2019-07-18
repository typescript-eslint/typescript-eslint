import rules from '../../src/rules';
import allConfig from '../../src/configs/all.json';

interface JsonRules {
  [name: string]: string;
}

describe('all.json config', () => {
  const RULE_NAME_PREFIX = '@typescript-eslint/';

  const rulesNames = Object.keys(rules) as (keyof typeof rules)[];
  const notDeprecatedRuleNames = rulesNames.reduce<string[]>(
    (collection, name) => {
      if (!rules[name].meta.deprecated) {
        collection.push(`${RULE_NAME_PREFIX}${name}`);
      }
      return collection;
    },
    [],
  );

  // with end of Node.js 6 support, we can use Object.entries(allConfig.rules) here
  const configRules: JsonRules = allConfig.rules;
  const typescriptEslintConfigRules = Object.keys(configRules).filter(name =>
    name.startsWith(RULE_NAME_PREFIX),
  );
  const typescriptEslintConfigRuleValues = typescriptEslintConfigRules.map(
    name => configRules[name],
  );

  it('contains all @typescript-eslint/eslint-plugin rule modules, except the deprecated ones', () => {
    expect(notDeprecatedRuleNames).toEqual(
      expect.arrayContaining(typescriptEslintConfigRules),
    );
  });

  it('has all containing @typescript-eslint/eslint-plugin rules enabled with "error"', () => {
    expect(['error']).toEqual(
      expect.arrayContaining(typescriptEslintConfigRuleValues),
    );
  });
});
