import fs from 'node:fs';
import path from 'node:path';

import eslintPlugin from '@typescript-eslint/eslint-plugin';
import type {
  ClassicConfig,
  FlatConfig,
  Linter,
  RuleModule,
  RuleRecommendation,
} from '@typescript-eslint/utils/ts-eslint';
import prettier from 'prettier';

import {
  PACKAGES_ESLINT_PLUGIN,
  PACKAGES_TYPESCRIPT_ESLINT,
  PRETTIER_CONFIG_PATH,
} from './paths.mts';

// no need for us to bring in an entire dependency for a few simple terminal colors
const chalk = {
  dim: (val: string): string => `\x1B[2m${val}\x1B[22m`,
  green: (val: string): string => `\x1B[32m${val}\x1B[39m`,
  red: (val: string): string => `\x1B[31m${val}\x1B[39m`,
  blueBright: (val: string): string => `\x1B[94m${val}\x1B[39m`,
  gray: (val: string): string => `\x1B[90m${val}\x1B[39m`,
};

const AUTO_GENERATED_COMMENT_LINES = [
  '// THIS CODE WAS AUTOMATICALLY GENERATED',
  '// DO NOT EDIT THIS CODE BY HAND',
  '// SEE https://typescript-eslint.io/users/configs',
  '//',
  '// For developers working in the typescript-eslint monorepo:',
  '// You can regenerate it using `yarn generate:configs`',
  '',
] as const;

const EXTENDS_MODULES = [
  {
    name: 'baseConfig',
    packageRelativePath: './configs/base',
    moduleRelativePath: './base',
  },
  {
    name: 'eslintRecommendedConfig',
    packageRelativePath: './configs/eslint-recommended',
    moduleRelativePath: './eslint-recommended',
  },
] as const;
const CLASSIC_EXTENDS: readonly string[] = EXTENDS_MODULES.map(
  mod => mod.packageRelativePath,
);

async function main(): Promise<void> {
  function addAutoGeneratedComment(code?: string): string {
    return [...AUTO_GENERATED_COMMENT_LINES, code].join('\n');
  }

  const prettierConfig = await prettier.resolveConfig('file.ts', {
    config: PRETTIER_CONFIG_PATH,
  });

  type LinterConfigRules = Record<
    string,
    ClassicConfig.RuleLevel | [ClassicConfig.RuleLevel, ...unknown[]]
  >;

  interface LinterConfig extends ClassicConfig.Config {
    extends?: string[] | string;
    plugins?: string[];
  }

  const RULE_NAME_PREFIX = '@typescript-eslint/';
  const MAX_RULE_NAME_LENGTH = Object.keys(eslintPlugin.rules).reduce(
    (acc, name) => Math.max(acc, name.length),
    0,
  );
  const BASE_RULES_TO_BE_OVERRIDDEN = new Map(
    Object.entries(eslintPlugin.rules)
      .filter(([, rule]) => rule.meta.docs?.extendsBaseRule)
      .map(
        ([ruleName, rule]) =>
          [
            ruleName,
            typeof rule.meta.docs?.extendsBaseRule === 'string'
              ? rule.meta.docs.extendsBaseRule
              : ruleName,
          ] as const,
      ),
  );

  type RuleEntry = [string, RuleModule<string, readonly unknown[]>];

  const allRuleEntries: RuleEntry[] = Object.entries(eslintPlugin.rules).sort(
    (a, b) => a[0].localeCompare(b[0]),
  );

  type GetRuleOptions = (
    rule: RuleModule<string, readonly unknown[]>,
  ) => true | readonly unknown[] | undefined;

  interface ConfigRuleSettings {
    deprecated?: 'exclude';
    getOptions?: GetRuleOptions | undefined;
    typeChecked?: 'exclude' | 'include-only';
    baseRuleForExtensionRule?: 'exclude';
    forcedRuleLevel?: Linter.RuleLevel;
  }

  /**
   * Helper function reduces records to key - value pairs.
   */
  function reducer(
    config: LinterConfigRules,
    [key, value]: RuleEntry,
    settings: ConfigRuleSettings = {},
  ): LinterConfigRules {
    if (settings.deprecated && value.meta.deprecated) {
      return config;
    }

    // Explicitly exclude rules requiring type-checking
    if (
      settings.typeChecked === 'exclude' &&
      value.meta.docs?.requiresTypeChecking === true
    ) {
      return config;
    }

    if (
      settings.typeChecked === 'include-only' &&
      value.meta.docs?.requiresTypeChecking !== true
    ) {
      return config;
    }

    const ruleName = `${RULE_NAME_PREFIX}${key}`;

    if (
      settings.baseRuleForExtensionRule !== 'exclude' &&
      BASE_RULES_TO_BE_OVERRIDDEN.has(key)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      chalk.red('error'),
    );

    const ruleLevel = settings.forcedRuleLevel ?? 'error';
    const ruleOptions = settings.getOptions?.(value);

    config[ruleName] =
      ruleOptions && ruleOptions !== true
        ? [ruleLevel, ...ruleOptions]
        : ruleLevel;

    return config;
  }

  /**
   * Helper function writes configuration.
   */
  async function writeConfig(
    getConfig: () => LinterConfig,
    name: string,
  ): Promise<void> {
    const hyphens = '-'.repeat(35 - Math.ceil(name.length / 2));
    console.log(chalk.blueBright(`\n${hyphens} ${name}.ts ${hyphens}`));

    const config = getConfig();

    //
    // 1. Classic Config - written to the eslint-plugin package
    // These configs are just JSON blobs that we write as TS files
    //

    // note: we use `export =` because ESLint will import these configs via a commonjs import
    const classicCode = [
      "import type { ClassicConfig } from '@typescript-eslint/utils/ts-eslint';",
      '',
      `export = ${JSON.stringify(config)} satisfies ClassicConfig.Config;`,
    ].join('\n');
    const classicConfigStr = await prettier.format(
      addAutoGeneratedComment(classicCode),
      {
        parser: 'typescript',
        ...prettierConfig,
      },
    );
    fs.writeFileSync(
      path.join(PACKAGES_ESLINT_PLUGIN, 'src', 'configs', `${name}.ts`),
      classicConfigStr,
    );

    //
    // 2. Flat Config - written to the core package
    // These configs are actual TS modules that import other configs
    //
    const flatCode: string[] = [
      ...AUTO_GENERATED_COMMENT_LINES,
      "import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';",
      '',
    ];
    const flatExtends: string[] = [];
    const flatConfig: FlatConfig.Config = {
      rules: config.rules,
    };
    if (config.extends) {
      for (const extendPath of config.extends) {
        const config = EXTENDS_MODULES.find(
          mod => mod.packageRelativePath === extendPath,
        );
        if (config == null) {
          throw new Error("Couldn't find config");
        }
        flatCode.push(
          `import ${config.name} from '${config.moduleRelativePath}';`,
        );
        flatExtends.push(config.name);
      }
      flatCode.push('');
    }
    if (config.parserOptions) {
      flatConfig.languageOptions ??= {};
      flatConfig.languageOptions.parserOptions = config.parserOptions;
    }

    const flatConfigJson = JSON.stringify(flatConfig);
    if (flatExtends.length > 0) {
      flatCode.push(
        'export default (plugin: FlatConfig.Plugin, parser: FlatConfig.Parser): FlatConfig.ConfigArray => [',
        ...flatExtends.map(ext => `${ext}(plugin, parser),`),
        flatConfigJson,
        '];',
      );
    } else {
      flatCode.push(
        `export default (_plugin: FlatConfig.Plugin, _parser: FlatConfig.Parser): FlatConfig.Config => (${flatConfigJson});`,
      );
    }
    const flatConfigStr = await prettier.format(flatCode.join('\n'), {
      parser: 'typescript',
      ...prettierConfig,
    });
    fs.writeFileSync(
      path.join(PACKAGES_TYPESCRIPT_ESLINT, 'src', 'configs', `${name}.ts`),
      flatConfigStr,
    );
  }

  interface ExtendedConfigSettings {
    name: string;
    ruleEntries: readonly RuleEntry[];
    settings?: ConfigRuleSettings;
  }

  async function writeExtendedConfig({
    name,
    ruleEntries,
    settings,
  }: ExtendedConfigSettings): Promise<void> {
    await writeConfig(
      () => ({
        extends: [...CLASSIC_EXTENDS],
        rules: ruleEntries.reduce(
          (config, entry) => reducer(config, entry, settings),
          {},
        ),
      }),
      name,
    );
  }

  function filterRuleEntriesTo(
    ...recommendations: (RuleRecommendation | undefined)[]
  ): RuleEntry[] {
    return allRuleEntries.filter(([, rule]) =>
      typeof rule.meta.docs?.recommended === 'object'
        ? Object.keys(rule.meta.docs.recommended).some(level =>
            recommendations.includes(level as RuleRecommendation),
          )
        : recommendations.includes(rule.meta.docs?.recommended),
    );
  }

  function createGetOptionsForLevel(
    level: 'recommended' | 'strict',
  ): GetRuleOptions {
    return rule =>
      typeof rule.meta.docs?.recommended === 'object'
        ? rule.meta.docs.recommended[level]
        : undefined;
  }

  await writeExtendedConfig({
    name: 'all',
    settings: {
      deprecated: 'exclude',
    },
    ruleEntries: allRuleEntries,
  });

  await writeExtendedConfig({
    settings: {
      getOptions: createGetOptionsForLevel('recommended'),
      typeChecked: 'exclude',
    },
    name: 'recommended',
    ruleEntries: filterRuleEntriesTo('recommended'),
  });

  await writeExtendedConfig({
    name: 'recommended-type-checked',
    ruleEntries: filterRuleEntriesTo('recommended'),
    settings: {
      getOptions: createGetOptionsForLevel('recommended'),
    },
  });

  await writeExtendedConfig({
    settings: {
      getOptions: createGetOptionsForLevel('recommended'),
      typeChecked: 'include-only',
    },
    name: 'recommended-type-checked-only',
    ruleEntries: filterRuleEntriesTo('recommended'),
  });

  await writeExtendedConfig({
    settings: {
      getOptions: createGetOptionsForLevel('strict'),
      typeChecked: 'exclude',
    },
    name: 'strict',
    ruleEntries: filterRuleEntriesTo('recommended', 'strict'),
  });

  await writeExtendedConfig({
    settings: {
      getOptions: createGetOptionsForLevel('strict'),
    },
    name: 'strict-type-checked',
    ruleEntries: filterRuleEntriesTo('recommended', 'strict'),
  });

  await writeExtendedConfig({
    settings: {
      getOptions: createGetOptionsForLevel('strict'),
      typeChecked: 'include-only',
    },
    name: 'strict-type-checked-only',
    ruleEntries: filterRuleEntriesTo('recommended', 'strict'),
  });

  await writeExtendedConfig({
    settings: {
      typeChecked: 'exclude',
    },
    name: 'stylistic',
    ruleEntries: filterRuleEntriesTo('stylistic'),
  });

  await writeExtendedConfig({
    name: 'stylistic-type-checked',
    ruleEntries: filterRuleEntriesTo('stylistic'),
  });

  await writeExtendedConfig({
    settings: {
      typeChecked: 'include-only',
    },
    name: 'stylistic-type-checked-only',
    ruleEntries: filterRuleEntriesTo('stylistic'),
  });

  await writeConfig(
    () => ({
      parserOptions: {
        project: false,
        program: null,
      },
      rules: allRuleEntries.reduce(
        (config, entry) =>
          reducer(config, entry, {
            typeChecked: 'include-only',
            baseRuleForExtensionRule: 'exclude',
            forcedRuleLevel: 'off',
          }),
        {},
      ),
    }),
    'disable-type-checked',
  );
}

main().catch((error: unknown) => {
  console.error(error);
});
