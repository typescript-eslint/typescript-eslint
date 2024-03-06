import rules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type {
  FlatConfig,
  RuleRecommendation,
} from '@typescript-eslint/utils/ts-eslint';

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

function filterRules(
  values: FlatConfig.Rules | undefined,
): [string, FlatConfig.RuleEntry][] {
  expect(values).toBeDefined();
  return Object.entries(values!)
    .filter((pair): pair is [string, FlatConfig.RuleEntry] => pair[1] != null)
    .filter(([name]) => name.startsWith(RULE_NAME_PREFIX));
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
}: FilterAndMapRuleConfigsSettings = {}): [string, string][] {
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
    result = result.filter(([, rule]) =>
      recommendations.includes(rule.meta.docs?.recommended),
    );
  }

  return result.map(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'error']);
}

function itHasBaseRulesOverriden(
  unfilteredConfigRules: FlatConfig.Rules | undefined,
): void {
  it('has the base rules overriden by the appropriate extension rules', () => {
    expect(unfilteredConfigRules).toBeDefined();
    const ruleNames = new Set(Object.keys(unfilteredConfigRules!));
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
  const unfilteredConfigRules = plugin.configs.all[2]?.rules;

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
  const unfilteredConfigRules = plugin.configs.disableTypeChecked.rules;

  it('disables all type checked rules', () => {
    const configRules = filterRules(unfilteredConfigRules);

    const ruleConfigs: [string, string][] = Object.entries(rules)
      .filter(([, rule]) => rule.meta.docs?.requiresTypeChecking)
      .map(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'off']);

    expect(entriesToObject(ruleConfigs)).toEqual(entriesToObject(configRules));
  });
});

describe('recommended.ts', () => {
  const unfilteredConfigRules = plugin.configs.recommended[2]?.rules;

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
  const unfilteredConfigRules = plugin.configs.recommendedTypeChecked[2]?.rules;

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
  const unfilteredConfigRules =
    plugin.configs.recommendedTypeCheckedOnly[2]?.rules;

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
  const unfilteredConfigRules = plugin.configs.strict[2]?.rules;

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
  const unfilteredConfigRules = plugin.configs.strictTypeChecked[2]?.rules;

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
  const unfilteredConfigRules = plugin.configs.strictTypeCheckedOnly[2]?.rules;

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
  const unfilteredConfigRules = plugin.configs.stylistic[2]?.rules;

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
  const unfilteredConfigRules = plugin.configs.stylisticTypeChecked[2]?.rules;
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
  const unfilteredConfigRules =
    plugin.configs.stylisticTypeCheckedOnly[2]?.rules;

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

describe('config helper', () => {
  it('works without extends', () => {
    expect(
      plugin.config({
        files: ['file'],
        rules: { rule: 'error' },
        ignores: ['ignored'],
      }),
    ).toEqual([
      {
        files: ['file'],
        rules: { rule: 'error' },
        ignores: ['ignored'],
      },
    ]);
  });

  it('flattens extended configs', () => {
    expect(
      plugin.config({
        rules: { rule: 'error' },
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
      }),
    ).toEqual([
      { rules: { rule1: 'error' } },
      { rules: { rule2: 'error' } },
      { rules: { rule: 'error' } },
    ]);
  });

  it('flattens extended configs with files and ignores', () => {
    expect(
      plugin.config({
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
      }),
    ).toEqual([
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule1: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule2: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
      },
    ]);
  });
});
