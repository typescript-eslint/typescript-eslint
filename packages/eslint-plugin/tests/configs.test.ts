import type { RuleRecommendation } from '@typescript-eslint/utils/ts-eslint';

import plugin from '../src/index.js';
import rules from '../src/rules/index.js';

const rulesEntriesList = Object.entries(rules);

const RULE_NAME_PREFIX = '@typescript-eslint/';
const EXTENSION_RULES = rulesEntriesList
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

function filterRules(
  values: Record<string, string | unknown[]>,
): [string, string | unknown[]][] {
  return Object.entries(values).filter(([name]) =>
    name.startsWith(RULE_NAME_PREFIX),
  );
}

interface FilterAndMapRuleConfigsSettings {
  excludeDeprecated?: boolean;
  recommendations?: (RuleRecommendation | undefined)[];
  typeChecked?: 'exclude' | 'include-only';
}

function filterAndMapRuleConfigs({
  excludeDeprecated,
  recommendations,
  typeChecked,
}: FilterAndMapRuleConfigsSettings = {}): [string, unknown][] {
  let result = rulesEntriesList;

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
        case 'object':
          return Object.keys(rule.meta.docs.recommended).some(recommended =>
            recommendations.includes(recommended as RuleRecommendation),
          );
        case 'string':
          return recommendations.includes(rule.meta.docs.recommended);
        default:
          return false;
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

const localTest = test.extend<{
  unfilteredConfigRules: Record<string, string | unknown[]>;
  expectedOverrides: Record<string, 'off'>;
  configRulesObject: Record<string, string | unknown[]>;
}>({
  configRulesObject: [
    async ({ unfilteredConfigRules }, use) => {
      const configRules = filterRules(unfilteredConfigRules);

      const configRulesObject = Object.fromEntries(configRules);

      await use(configRulesObject);
    },
    { auto: false },
  ],

  expectedOverrides: [
    async ({ unfilteredConfigRules }, use) => {
      const ruleNames = new Set(Object.keys(unfilteredConfigRules));

      const expectedOverrides = Object.fromEntries(
        EXTENSION_RULES.filter(([ruleName]) => ruleNames.has(ruleName)).map(
          ([, extRuleName]) => [extRuleName, 'off'] as const,
        ),
      );

      await use(expectedOverrides);
    },
    { auto: false },
  ],

  unfilteredConfigRules: [plugin.configs.all.rules, { auto: true }],
});

describe('all.ts', () => {
  localTest('contains all of the rules', ({ configRulesObject }) => {
    // note: exclude deprecated rules, this config is allowed to change between minor versions
    const ruleConfigs = filterAndMapRuleConfigs({
      excludeDeprecated: true,
    });

    expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
  });

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('disable-type-checked.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: plugin.configs['disable-type-checked'].rules,
  });

  localTest('disables all type checked rules', ({ configRulesObject }) => {
    const ruleConfigs = rulesEntriesList
      .filter(([, rule]) => rule.meta.docs?.requiresTypeChecking)
      .map(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'off'] as const);

    expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
  });
});

describe('recommended.ts', () => {
  localTest.scoped({ unfilteredConfigRules: plugin.configs.recommended.rules });

  localTest(
    'contains all recommended rules, excluding type checked ones',
    ({ configRulesObject }) => {
      // note: include deprecated rules so that the config doesn't change between major bumps
      const ruleConfigs = filterAndMapRuleConfigs({
        recommendations: ['recommended'],
        typeChecked: 'exclude',
      });

      expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
    },
  );

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('recommended-type-checked.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: plugin.configs['recommended-type-checked'].rules,
  });

  localTest('contains all recommended rules', ({ configRulesObject }) => {
    // note: include deprecated rules so that the config doesn't change between major bumps
    const ruleConfigs = filterAndMapRuleConfigs({
      recommendations: ['recommended'],
    });

    expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
  });

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('recommended-type-checked-only.ts', () => {
  localTest.scoped({
    unfilteredConfigRules:
      plugin.configs['recommended-type-checked-only'].rules,
  });

  localTest(
    'contains only type-checked recommended rules',
    ({ configRulesObject }) => {
      // note: include deprecated rules so that the config doesn't change between major bumps
      const ruleConfigs = filterAndMapRuleConfigs({
        recommendations: ['recommended'],
        typeChecked: 'include-only',
      }).filter(([ruleName]) => ruleName);

      expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
    },
  );

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('strict.ts', () => {
  localTest.scoped({ unfilteredConfigRules: plugin.configs.strict.rules });

  localTest(
    'contains all strict rules, excluding type checked ones',
    ({ configRulesObject }) => {
      // note: exclude deprecated rules, this config is allowed to change between minor versions
      const ruleConfigs = filterAndMapRuleConfigs({
        excludeDeprecated: true,
        recommendations: ['recommended', 'strict'],
        typeChecked: 'exclude',
      });

      expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
    },
  );

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('strict-type-checked.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: plugin.configs['strict-type-checked'].rules,
  });

  localTest('contains all strict rules', ({ configRulesObject }) => {
    // note: exclude deprecated rules, this config is allowed to change between minor versions
    const ruleConfigs = filterAndMapRuleConfigs({
      excludeDeprecated: true,
      recommendations: ['recommended', 'strict'],
    });

    expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
  });

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('strict-type-checked-only.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: plugin.configs['strict-type-checked-only'].rules,
  });

  localTest(
    'contains only type-checked strict rules',
    ({ configRulesObject }) => {
      // note: exclude deprecated rules, this config is allowed to change between minor versions
      const ruleConfigs = filterAndMapRuleConfigs({
        excludeDeprecated: true,
        recommendations: ['recommended', 'strict'],
        typeChecked: 'include-only',
      }).filter(([ruleName]) => ruleName);

      expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
    },
  );

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('stylistic.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: plugin.configs.stylistic.rules,
  });

  localTest(
    'contains all stylistic rules, excluding deprecated or type checked ones',
    ({ configRulesObject }) => {
      // note: include deprecated rules so that the config doesn't change between major bumps
      const ruleConfigs = filterAndMapRuleConfigs({
        recommendations: ['stylistic'],
        typeChecked: 'exclude',
      });

      expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
    },
  );

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('stylistic-type-checked.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: plugin.configs['stylistic-type-checked'].rules,
  });

  localTest(
    'contains all stylistic rules, excluding deprecated ones',
    ({ configRulesObject }) => {
      // note: include deprecated rules so that the config doesn't change between major bumps
      const ruleConfigs = filterAndMapRuleConfigs({
        recommendations: ['stylistic'],
      });

      expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
    },
  );

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});

describe('stylistic-type-checked-only.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: plugin.configs['stylistic-type-checked-only'].rules,
  });

  localTest(
    'contains only type-checked stylistic rules',
    ({ configRulesObject }) => {
      // note: include deprecated rules so that the config doesn't change between major bumps
      const ruleConfigs = filterAndMapRuleConfigs({
        recommendations: ['stylistic'],
        typeChecked: 'include-only',
      }).filter(([ruleName]) => ruleName);

      expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
    },
  );

  localTest(
    'has the base rules overridden by the appropriate extension rules',
    ({ expectedOverrides, unfilteredConfigRules }) => {
      expect(unfilteredConfigRules).toMatchObject(expectedOverrides);
    },
  );
});
