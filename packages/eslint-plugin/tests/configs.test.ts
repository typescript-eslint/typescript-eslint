import type { RuleRecommendation } from '@typescript-eslint/utils/src/ts-eslint';

import plugin from '../src/index';
import rules from '../src/rules';

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

interface FilterAndMapRuleConfigsSettings {
  excludeDeprecated?: boolean;
  excludeTypeChecked?: boolean;
  recommendations?: (RuleRecommendation | undefined)[];
}

function filterAndMapRuleConfigs({
  excludeDeprecated,
  excludeTypeChecked,
  recommendations,
}: FilterAndMapRuleConfigsSettings = {}): [string, string][] {
  let result = Object.entries(rules);

  if (excludeDeprecated) {
    result = result.filter(([, rule]) => !rule.meta.deprecated);
  }

  if (excludeTypeChecked) {
    result = result.filter(([, rule]) => !rule.meta.docs?.requiresTypeChecking);
  }

  if (recommendations) {
    result = result.filter(([, rule]) =>
      recommendations.includes(rule.meta.docs?.recommended),
    );
  }

  return result.map(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'error']);
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

describe('all.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs.all.rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: exclude deprecated rules, this config is allowed to change between minor versions
  const ruleConfigs = filterAndMapRuleConfigs({
    excludeDeprecated: true,
  });

  it('contains all of the rules, excluding the deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('recommended.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs.recommended.rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = filterAndMapRuleConfigs({
    excludeTypeChecked: true,
    recommendations: ['recommended'],
  });

  it('contains all recommended rules, excluding the deprecated or type checkedones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('recommended-type-checked.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['recommended-type-checked'].rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = filterAndMapRuleConfigs({
    recommendations: ['recommended'],
  });

  it('contains all recommended rules, excluding the deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('strict.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['strict'].rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: exclude deprecated rules, this config is allowed to change between minor versions
  const ruleConfigs = filterAndMapRuleConfigs({
    excludeDeprecated: true,
    excludeTypeChecked: true,
    recommendations: ['recommended', 'strict'],
  });

  it('contains all strict rules, excluding deprecated or type checked ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('strict-type-checked.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['strict-type-checked'].rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: exclude deprecated rules, this config is allowed to change between minor versions
  const ruleConfigs = filterAndMapRuleConfigs({
    excludeDeprecated: true,
    recommendations: ['recommended', 'strict'],
  });

  it('contains all strict rules, excluding deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('stylistic.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['stylistic'].rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = filterAndMapRuleConfigs({
    excludeTypeChecked: true,
    recommendations: ['stylistic'],
  });

  it('contains all stylistic rules, excluding deprecated or type checked ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('stylistic-type-checked.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['stylistic-type-checked'].rules;
  const configRules = filterRules(unfilteredConfigRules);
  // note: include deprecated rules so that the config doesn't change between major bumps
  const ruleConfigs = filterAndMapRuleConfigs({
    recommendations: ['stylistic'],
  });

  it('contains all stylistic rules, excluding deprecated ones', () => {
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});
