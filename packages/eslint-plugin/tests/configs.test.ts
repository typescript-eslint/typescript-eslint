import type { RuleRecommendation } from '@typescript-eslint/utils/ts-eslint';

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

function filterRules(
  values: Record<string, string | unknown[]>,
): [string, string | unknown[]][] {
  return Object.entries(values).filter(([name]) =>
    name.startsWith(RULE_NAME_PREFIX),
  );
}

interface FilterAndMapRuleConfigsSettings {
  excludeDeprecated?: boolean;
  typeChecked?: 'exclude' | 'include-only';
  recommendations?: (RuleRecommendation | undefined)[];
}

function filterAndMapRuleConfigs({
  excludeDeprecated,
  typeChecked,
  recommendations,
}: FilterAndMapRuleConfigsSettings = {}): [string, unknown][] {
  let result = Object.entries(rules);

  if (excludeDeprecated) {
    result = result.filter(([, rule]) => !rule.meta.deprecated);
  }

  if (typeChecked) {
    result = result.filter(([, rule]) =>
      typeChecked === 'exclude'
        ? !rule.meta.docs?.requiresTypeChecking
        : rule.meta.docs?.requiresTypeChecking,
    );
  }

  if (recommendations) {
    result = result.filter(([, rule]) => {
      switch (typeof rule.meta.docs?.recommended) {
        case 'undefined':
          return false;
        case 'object':
          return Object.keys(rule.meta.docs.recommended).some(recommended =>
            recommendations.includes(recommended as RuleRecommendation),
          );
        case 'string':
          return recommendations.includes(rule.meta.docs.recommended);
      }
    });
  }

  const highestRecommendation = recommendations?.filter(Boolean).at(-1);

  return result.map(([name, rule]) => {
    const customRecommendation =
      highestRecommendation &&
      typeof rule.meta.docs?.recommended === 'object' &&
      rule.meta.docs.recommended[
        highestRecommendation as 'recommended' | 'strict'
      ];

    return [
      `${RULE_NAME_PREFIX}${name}`,
      customRecommendation && typeof customRecommendation !== 'boolean'
        ? ['error', customRecommendation[0]]
        : 'error',
    ];
  });
}

function itHasBaseRulesOverriden(
  unfilteredConfigRules: Record<string, string | unknown[]>,
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

  it('contains all of the rules', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: exclude deprecated rules, this config is allowed to change between minor versions
    const ruleConfigs = filterAndMapRuleConfigs({
      excludeDeprecated: true,
    });

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('disable-type-checked.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['disable-type-checked'].rules;

  it('disables all type checked rules', () => {
    const configRules = filterRules(unfilteredConfigRules);

    const ruleConfigs: [string, string][] = Object.entries(rules)
      .filter(([, rule]) => rule.meta.docs?.requiresTypeChecking)
      .map(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'off']);

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });
});

describe('recommended.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs.recommended.rules;

  it('contains all recommended rules, excluding type checked ones', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: include deprecated rules so that the config doesn't change between major bumps
    const ruleConfigs = filterAndMapRuleConfigs({
      typeChecked: 'exclude',
      recommendations: ['recommended'],
    });

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('recommended-type-checked.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['recommended-type-checked'].rules;

  it('contains all recommended rules', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: include deprecated rules so that the config doesn't change between major bumps
    const ruleConfigs = filterAndMapRuleConfigs({
      recommendations: ['recommended'],
    });

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('recommended-type-checked-only.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['recommended-type-checked-only'].rules;

  it('contains only type-checked recommended rules', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: include deprecated rules so that the config doesn't change between major bumps
    const ruleConfigs = filterAndMapRuleConfigs({
      typeChecked: 'include-only',
      recommendations: ['recommended'],
    }).filter(([ruleName]) => ruleName);

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('strict.ts', () => {
  const unfilteredConfigRules: Record<string, string | unknown[]> =
    plugin.configs.strict.rules;

  it('contains all strict rules, excluding type checked ones', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: exclude deprecated rules, this config is allowed to change between minor versions
    const ruleConfigs = filterAndMapRuleConfigs({
      excludeDeprecated: true,
      typeChecked: 'exclude',
      recommendations: ['recommended', 'strict'],
    });

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('strict-type-checked.ts', () => {
  const unfilteredConfigRules: Record<string, string | unknown[]> =
    plugin.configs['strict-type-checked'].rules;

  it('contains all strict rules', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: exclude deprecated rules, this config is allowed to change between minor versions
    const ruleConfigs = filterAndMapRuleConfigs({
      excludeDeprecated: true,
      recommendations: ['recommended', 'strict'],
    });
    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('strict-type-checked-only.ts', () => {
  const unfilteredConfigRules: Record<string, string | unknown[]> =
    plugin.configs['strict-type-checked-only'].rules;

  it('contains only type-checked strict rules', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: exclude deprecated rules, this config is allowed to change between minor versions
    const ruleConfigs = filterAndMapRuleConfigs({
      excludeDeprecated: true,
      typeChecked: 'include-only',
      recommendations: ['recommended', 'strict'],
    }).filter(([ruleName]) => ruleName);

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});

describe('stylistic.ts', () => {
  const unfilteredConfigRules: Record<string, string | unknown[]> =
    plugin.configs.stylistic.rules;

  it('contains all stylistic rules, excluding deprecated or type checked ones', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: include deprecated rules so that the config doesn't change between major bumps
    const ruleConfigs = filterAndMapRuleConfigs({
      typeChecked: 'exclude',
      recommendations: ['stylistic'],
    });

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

describe('stylistic-type-checked-only.ts', () => {
  const unfilteredConfigRules: Record<string, string> =
    plugin.configs['stylistic-type-checked-only'].rules;

  it('contains only type-checked stylistic rules', () => {
    const configRules = filterRules(unfilteredConfigRules);
    // note: include deprecated rules so that the config doesn't change between major bumps
    const ruleConfigs = filterAndMapRuleConfigs({
      typeChecked: 'include-only',
      recommendations: ['stylistic'],
    }).filter(([ruleName]) => ruleName);

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });

  itHasBaseRulesOverriden(unfilteredConfigRules);
});
