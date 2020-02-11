import { TSESLint } from '@typescript-eslint/experimental-utils';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { format, resolveConfig } from 'prettier';
import rules from '../src/rules';

const prettierConfig = resolveConfig(__dirname);

interface LinterConfigRules {
  [name: string]:
    | TSESLint.Linter.RuleLevel
    | TSESLint.Linter.RuleLevelAndOptions;
}

interface LinterConfig extends TSESLint.Linter.Config {
  extends?: string | string[];
  plugins?: string[];
}

const RULE_NAME_PREFIX = '@typescript-eslint/';
const MAX_RULE_NAME_LENGTH = Object.keys(rules).reduce(
  (acc, name) => Math.max(acc, name.length),
  0,
);
const DEFAULT_RULE_SETTING = 'warn';
const BASE_RULES_TO_BE_OVERRIDDEN = new Map(
  Object.entries(rules)
    .filter(([, rule]) => rule.meta.docs?.extendsBaseRule)
    .map(
      ([ruleName, rule]) =>
        [
          ruleName,
          typeof rule.meta.docs?.extendsBaseRule === 'string'
            ? rule.meta.docs?.extendsBaseRule
            : ruleName,
        ] as const,
    ),
);
// list of rules from the base plugin that we think should be turned on for typescript code
const BASE_RULES_THAT_ARE_RECOMMENDED = new Set([
  'no-var',
  'prefer-const',
  'prefer-rest-params',
  'prefer-spread',
]);

const ruleEntries = Object.entries(rules).sort((a, b) =>
  a[0].localeCompare(b[0]),
);

/**
 * Helper function reduces records to key - value pairs.
 * @param config
 * @param entry
 * @param settings
 */
function reducer<TMessageIds extends string>(
  config: LinterConfigRules,
  entry: [string, TSESLint.RuleModule<TMessageIds, unknown[]>],
  settings: {
    errorLevel?: 'error' | 'warn';
    filterDeprecated: boolean;
    filterRequiresTypeChecking?: 'include' | 'exclude';
  },
): LinterConfigRules {
  const key = entry[0];
  const value = entry[1];

  if (settings.filterDeprecated && value.meta.deprecated) {
    return config;
  }

  // Explicitly exclude rules requiring type-checking
  if (
    settings.filterRequiresTypeChecking === 'exclude' &&
    value.meta.docs?.requiresTypeChecking === true
  ) {
    return config;
  }

  // Explicitly include rules requiring type-checking
  if (
    settings.filterRequiresTypeChecking === 'include' &&
    value.meta.docs?.requiresTypeChecking !== true
  ) {
    return config;
  }

  const ruleName = `${RULE_NAME_PREFIX}${key}`;
  const recommendation = value.meta.docs?.recommended;
  const usedSetting = settings.errorLevel
    ? settings.errorLevel
    : !recommendation
    ? DEFAULT_RULE_SETTING
    : recommendation;

  if (BASE_RULES_TO_BE_OVERRIDDEN.has(key)) {
    const baseRuleName = BASE_RULES_TO_BE_OVERRIDDEN.get(key)!;
    console.log(
      baseRuleName
        .padStart(RULE_NAME_PREFIX.length + baseRuleName.length)
        .padEnd(RULE_NAME_PREFIX.length + MAX_RULE_NAME_LENGTH),
      '=',
      chalk.green('off'),
    );
    config[baseRuleName] = 'off';
  }
  console.log(
    `${chalk.dim(RULE_NAME_PREFIX)}${key.padEnd(MAX_RULE_NAME_LENGTH)}`,
    '=',
    usedSetting === 'error'
      ? chalk.red(usedSetting)
      : chalk.yellow(usedSetting),
  );
  config[ruleName] = usedSetting;

  return config;
}

/**
 * Helper function writes configuration.
 */
function writeConfig(config: LinterConfig, filePath: string): void {
  const configStr = format(JSON.stringify(config), {
    parser: 'json',
    ...prettierConfig,
  });
  fs.writeFileSync(filePath, configStr);
}

const baseConfig: LinterConfig = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
};
writeConfig(baseConfig, path.resolve(__dirname, '../src/configs/base.json'));

console.log();
console.log(
  '------------------------------------------------ all.json ------------------------------------------------',
);
const allConfig: LinterConfig = {
  extends: 'plugin:@typescript-eslint/base',
  rules: ruleEntries.reduce<LinterConfigRules>(
    (config, entry) =>
      reducer(config, entry, { errorLevel: 'error', filterDeprecated: true }),
    {},
  ),
};
writeConfig(allConfig, path.resolve(__dirname, '../src/configs/all.json'));

console.log();
console.log(
  '------------------------------ recommended.json (should not require program) ------------------------------',
);
const recommendedRules = ruleEntries
  .filter(entry => !!entry[1].meta.docs?.recommended)
  .reduce<LinterConfigRules>(
    (config, entry) =>
      reducer(config, entry, {
        filterDeprecated: false,
        filterRequiresTypeChecking: 'exclude',
      }),
    {},
  );
BASE_RULES_THAT_ARE_RECOMMENDED.forEach(ruleName => {
  recommendedRules[ruleName] = 'error';
});
const recommendedConfig: LinterConfig = {
  extends: 'plugin:@typescript-eslint/base',
  rules: recommendedRules,
};
writeConfig(
  recommendedConfig,
  path.resolve(__dirname, '../src/configs/recommended.json'),
);

console.log();
console.log(
  '--------------------------------- recommended-requiring-type-checking.json ---------------------------------',
);
const recommendedRulesRequiringProgram = ruleEntries
  .filter(entry => !!entry[1].meta.docs?.recommended)
  .reduce<LinterConfigRules>(
    (config, entry) =>
      reducer(config, entry, {
        filterDeprecated: false,
        filterRequiresTypeChecking: 'include',
      }),
    {},
  );
BASE_RULES_THAT_ARE_RECOMMENDED.forEach(ruleName => {
  recommendedRulesRequiringProgram[ruleName] = 'error';
});
const recommendedRequiringTypeCheckingConfig: LinterConfig = {
  extends: 'plugin:@typescript-eslint/base',
  rules: recommendedRulesRequiringProgram,
};
writeConfig(
  recommendedRequiringTypeCheckingConfig,
  path.resolve(
    __dirname,
    '../src/configs/recommended-requiring-type-checking.json',
  ),
);
