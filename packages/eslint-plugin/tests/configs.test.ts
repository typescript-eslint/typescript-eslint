import rules from '../src/rules';
import plugin from '../src/index';

const RULE_NAME_PREFIX = '@typescript-eslint/';
const EXTENSION_RULES = Object.entries(rules)
  .filter(([, rule]) => rule.meta.docs?.extendsBaseRule)
  .map(
    ([ruleName, rule]) =>
      [
        `${RULE_NAME_PREFIX}${ruleName}`,
        typeof rule.meta.docs?.extendsBaseRule === 'string'
          ? rule.meta.docs.extendsBaseRule
          : ruleName,
      ] as const,
  );

function entriesToObject<T = unknown>(value: [string, T][]): Record<string, T> {
  return value.reduce<Record<string, T>>((accum, [k, v]) => {
    accum[k] = v;
    return accum;
  }, {});
}

function filterRules(values: Record<string, string>): [string, string][] {
  return Object.entries(values).filter(([name]) =>
    name.startsWith(RULE_NAME_PREFIX),
  );
}

function itHasBaseRulesOverriden(
  unfilteredConfigRules: Record<string, string>,
): void {
  it('has the base rules overriden by the appropriate extension rules', () => {
    const ruleNames = new Set(Object.keys(unfilteredConfigRules));
    EXTENSION_RULES.forEach(([ruleName, extRuleName]) => {
      if (ruleNames.has(ruleName)) {
        // this looks a little weird, but it provides the cleanest test output style
        expect(unfilteredConfigRules).toMatchObject({
          ...unfilteredConfigRules,
          [extRuleName]: 'off',
        });
      }
    });
  });
}

describe('all.json config', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs.all.rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: exclude deprecated rules, this config is allowed to change between minor versions
  const ruleConfigs = Object.entries(rules)
    .filter(([, rule]) => !rule.meta.deprecated)
    .map<[string, string]>(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'error']);

  it('contains all of the rules, excluding the deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('recommended.json config', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs.recommended.rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = Object.entries(rules)
    .filter(
      ([, rule]) =>
        rule.meta.docs?.recommended !== false &&
        rule.meta.docs?.requiresTypeChecking !== true,
    )
    .map<[string, string]>(([name, rule]) => [
      `${RULE_NAME_PREFIX}${name}`,
      rule.meta.docs?.recommended ? rule.meta.docs.recommended : 'off',
    ]);

  it("contains all recommended rules that don't require typechecking, excluding the deprecated ones", () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('recommended-requiring-type-checking.json config', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['recommended-requiring-type-checking'].rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = Object.entries(rules)
    .filter(
      ([, rule]) =>
        rule.meta.docs?.recommended !== false &&
        rule.meta.docs?.requiresTypeChecking === true,
    )
    .map<[string, string]>(([name, rule]) => [
      `${RULE_NAME_PREFIX}${name}`,
      rule.meta.docs?.recommended ? rule.meta.docs.recommended : 'off',
    ]);

  it('contains all recommended rules that require type checking, excluding the deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});
