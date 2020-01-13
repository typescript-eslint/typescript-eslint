import rules from '../src/rules';
import plugin from '../src/index';

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

const RULE_NAME_PREFIX = '@typescript-eslint/';

describe('all.json config', () => {
  const configRules = filterRules(plugin.configs.all.rules);
  // note: exclude deprecated rules, this config is allowed to change between minor versions
  const ruleConfigs = Object.entries(rules)
    .filter(([, rule]) => !rule.meta.deprecated)
    .map<[string, string]>(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'error']);

  it('contains all of the rules, excluding the deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });
});

describe('recommended.json config', () => {
  const configRules = filterRules(plugin.configs.recommended.rules);
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = Object.entries(rules)
    .filter(
      ([, rule]) =>
        rule.meta.docs.recommended !== false &&
        rule.meta.docs.requiresTypeChecking !== true,
    )
    .map<[string, string]>(([name, rule]) => [
      `${RULE_NAME_PREFIX}${name}`,
      rule.meta.docs.recommended || 'off',
    ]);

  it("contains all recommended rules that don't require typechecking, excluding the deprecated ones", () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });
});

describe('recommended-requiring-type-checking.json config', () => {
  const configRules = filterRules(
    plugin.configs['recommended-requiring-type-checking'].rules,
  );
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = Object.entries(rules)
    .filter(
      ([, rule]) =>
        rule.meta.docs.recommended !== false &&
        rule.meta.docs.requiresTypeChecking === true,
    )
    .map<[string, string]>(([name, rule]) => [
      `${RULE_NAME_PREFIX}${name}`,
      rule.meta.docs.recommended || 'off',
    ]);

  it('contains all recommended rules that require type checking, excluding the deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });
});
