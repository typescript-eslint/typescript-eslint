import type {
  FlatConfig,
  RuleRecommendation,
} from '@typescript-eslint/utils/ts-eslint';

import rules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import { clearCandidateTSConfigRootDirs } from '@typescript-eslint/typescript-estree';

import tseslint from '../src/index.js';

vi.mock('@typescript-eslint/typescript-estree', async () => ({
  ...(await vi.importActual('@typescript-eslint/typescript-estree')),
  get addCandidateTSConfigRootDir() {
    return mockAddCandidateTSConfigRootDir;
  },
}));

const mockGetTSConfigRootDirFromStack = vi.fn();

vi.mock('../src/getTSConfigRootDirFromStack', () => ({
  get getTSConfigRootDirFromStack() {
    return mockGetTSConfigRootDirFromStack;
  },
}));

const RULE_NAME_PREFIX = '@typescript-eslint/';
const EXTENSION_RULES = Object.entries(rules)
  .filter(([, rule]) => rule.meta.docs.extendsBaseRule)
  .map(
    ([ruleName, rule]) =>
      [
        `${RULE_NAME_PREFIX}${ruleName}`,
        typeof rule.meta.docs.extendsBaseRule === 'string'
          ? rule.meta.docs.extendsBaseRule
          : ruleName,
      ] as const,
  );

function filterRules(
  values: FlatConfig.Rules | undefined,
): [string, FlatConfig.RuleEntry][] {
  assert.isDefined(values);

  return Object.entries(values)
    .filter((pair): pair is [string, FlatConfig.RuleEntry] => pair[1] != null)
    .filter(([name]) => name.startsWith(RULE_NAME_PREFIX));
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
  let result = Object.entries(rules);

  if (excludeDeprecated) {
    result = result.filter(([, rule]) => !rule.meta.deprecated);
  }

  if (typeChecked) {
    result = result.filter(([, rule]) =>
      typeChecked === 'exclude'
        ? !rule.meta.docs.requiresTypeChecking
        : rule.meta.docs.requiresTypeChecking,
    );
  }

  if (recommendations) {
    result = result.filter(([, rule]) => {
      switch (typeof rule.meta.docs.recommended) {
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
      typeof rule.meta.docs.recommended === 'object' &&
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
  unfilteredConfigRules: FlatConfig.Rules | undefined;
  expectedOverrides: Record<string, 'off'>;
  configRulesObject: Record<string, FlatConfig.RuleEntry>;
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
      assert.isDefined(unfilteredConfigRules);

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

  unfilteredConfigRules: [tseslint.configs.all[2]?.rules, { auto: true }],
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
    unfilteredConfigRules: tseslint.configs.disableTypeChecked.rules,
  });

  localTest('disables all type checked rules', ({ configRulesObject }) => {
    const ruleConfigs = Object.entries(rules)
      .filter(([, rule]) => rule.meta.docs.requiresTypeChecking)
      .map(([name]) => [`${RULE_NAME_PREFIX}${name}`, 'off'] as const);

    expect(Object.fromEntries(ruleConfigs)).toStrictEqual(configRulesObject);
  });
});

describe('recommended.ts', () => {
  localTest.scoped({
    unfilteredConfigRules: tseslint.configs.recommended[2]?.rules,
  });

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
    unfilteredConfigRules: tseslint.configs.recommendedTypeChecked[2]?.rules,
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
      tseslint.configs.recommendedTypeCheckedOnly[2]?.rules,
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
  localTest.scoped({
    unfilteredConfigRules: tseslint.configs.strict[2]?.rules,
  });

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
    unfilteredConfigRules: tseslint.configs.strictTypeChecked[2]?.rules,
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
    unfilteredConfigRules: tseslint.configs.strictTypeCheckedOnly[2]?.rules,
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
    unfilteredConfigRules: tseslint.configs.stylistic[2]?.rules,
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
    unfilteredConfigRules: tseslint.configs.stylisticTypeChecked[2]?.rules,
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
    unfilteredConfigRules: tseslint.configs.stylisticTypeCheckedOnly[2]?.rules,
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

const mockAddCandidateTSConfigRootDir = vi.fn();

describe('Candidate tsconfigRootDirs', () => {
  beforeEach(() => {
    clearCandidateTSConfigRootDirs();
    mockAddCandidateTSConfigRootDir.mockClear();
  });

  describe.each(Object.keys(tseslint.configs))('%s', configKey => {
    it('does not populate a candidate tsconfigRootDir when accessed and one cannot be inferred from the stack', () => {
      mockGetTSConfigRootDirFromStack.mockReturnValue(undefined);

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      tseslint.configs[configKey as keyof typeof tseslint.configs];

      expect(mockAddCandidateTSConfigRootDir).not.toHaveBeenCalled();
    });

    it('populates a candidate tsconfigRootDir when accessed and one can be inferred from the stack', () => {
      const tsconfigRootDir = 'a/b/c/';

      mockGetTSConfigRootDirFromStack.mockReturnValue(tsconfigRootDir);

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      tseslint.configs[configKey as keyof typeof tseslint.configs];

      expect(mockAddCandidateTSConfigRootDir).toHaveBeenCalledWith(
        tsconfigRootDir,
      );
    });
  });
});
