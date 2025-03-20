import type { ESLintPluginRuleModule } from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type {
  ClassicConfig,
  FlatConfig,
  Linter,
  RuleRecommendation,
} from '@typescript-eslint/utils/ts-eslint';

import eslintPlugin from '@typescript-eslint/eslint-plugin';
import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';

import { PACKAGES_ESLINT_PLUGIN, PRETTIER_CONFIG_PATH } from './paths.mts';

// no need for us to bring in an entire dependency for a few simple terminal colors
const chalk = {
  blueBright: (val: string): string => `\x1B[94m${val}\x1B[39m`,
  dim: (val: string): string => `\x1B[2m${val}\x1B[22m`,
  gray: (val: string): string => `\x1B[90m${val}\x1B[39m`,
  green: (val: string): string => `\x1B[32m${val}\x1B[39m`,
  red: (val: string): string => `\x1B[31m${val}\x1B[39m`,
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
    moduleRelativePath: './base',
    name: 'baseConfig',
    packageRelativePath: './configs/base',
  },
  {
    moduleRelativePath: './eslint-recommended',
    name: 'eslintRecommendedConfig',
    packageRelativePath: './configs/eslint-recommended',
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
    [ClassicConfig.RuleLevel, ...unknown[]] | ClassicConfig.RuleLevel
  >;

  interface LinterConfig extends ClassicConfig.Config {
    extends?: string | string[];
    plugins?: string[];
  }

  const RULE_NAME_PREFIX = '@typescript-eslint/';
  const MAX_RULE_NAME_LENGTH = Math.max(
    ...Object.keys(eslintPlugin.rules).map(name => name.length),
  );
  const BASE_RULES_TO_BE_OVERRIDDEN = new Map(
    Object.entries(eslintPlugin.rules)
      .filter(([, rule]) => rule.meta.docs.extendsBaseRule)
      .map(
        ([ruleName, rule]) =>
          [
            ruleName,
            typeof rule.meta.docs.extendsBaseRule === 'string'
              ? rule.meta.docs.extendsBaseRule
              : ruleName,
          ] as const,
      ),
  );

  // special case - return-await used to be an extension, but no longer is.
  // See https://github.com/typescript-eslint/typescript-eslint/issues/9517
  BASE_RULES_TO_BE_OVERRIDDEN.set('return-await', 'no-return-await');

  type RuleEntry = [string, ESLintPluginRuleModule];

  const allRuleEntries: RuleEntry[] = Object.entries(eslintPlugin.rules).sort(
    (a, b) => a[0].localeCompare(b[0]),
  );

  type GetRuleOptions = (
    rule: ESLintPluginRuleModule,
  ) => readonly unknown[] | true | undefined;

  interface ConfigRuleSettings {
    baseRuleForExtensionRule?: 'exclude';
    deprecated?: 'exclude';
    forcedRuleLevel?: Linter.RuleLevel;
    getOptions?: GetRuleOptions | undefined;
    typeChecked?: 'exclude' | 'include-only';
  }

  /**
   * Helper function reduces records to key - value pairs.
   */
  function reducer(
    config: LinterConfigRules,
    [key, value]: RuleEntry,
    settings: ConfigRuleSettings = {},
  ): LinterConfigRules {
    if (value.meta.deprecated) {
      if (value.meta.docs.recommended) {
        throw new Error(`${key} is both deprecated and recommended.`);
      }
      if (settings.deprecated) {
        return config;
      }
    }

    // Explicitly exclude rules requiring type-checking
    if (
      settings.typeChecked === 'exclude' &&
      value.meta.docs.requiresTypeChecking === true
    ) {
      return config;
    }

    if (
      settings.typeChecked === 'include-only' &&
      value.meta.docs.requiresTypeChecking !== true
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

  interface WriteConfigSettings {
    description: string;
    getConfig: () => LinterConfig;
    name: string;
  }

  /**
   * Helper function that writes configuration.
   */
  async function writeConfig({
    description,
    getConfig,
    name,
  }: WriteConfigSettings): Promise<void> {
    const hyphens = '-'.repeat(35 - Math.ceil(name.length / 2));
    console.log(chalk.blueBright(`\n${hyphens} ${name}.ts ${hyphens}`));

    const config = getConfig();

    //
    // 1. Classic Config - written to eslint-plugin/src/configs/eslintrc
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
      path.join(
        PACKAGES_ESLINT_PLUGIN,
        'src',
        'configs',
        'eslintrc',
        `${name}.ts`,
      ),
      classicConfigStr,
    );

    //
    // 2. Flat Config - written to the eslint-plugin/src/configs/flat
    // These configs are actual TS modules that import other configs
    //
    const flatCode: string[] = [
      ...AUTO_GENERATED_COMMENT_LINES,
      "import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';",
      '',
    ];
    const flatExtends: string[] = [];
    const flatConfig: FlatConfig.Config = {
      name: `typescript-eslint/${name}`,
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

    const docComment = `/**
      * ${description}
      * @see {@link https://typescript-eslint.io/users/configs#${name}}
      */`;
    const flatConfigJson = JSON.stringify(flatConfig);
    if (flatExtends.length > 0) {
      flatCode.push(
        docComment,
        'export default (plugin: FlatConfig.Plugin, parser: FlatConfig.Parser): FlatConfig.ConfigArray => [',
        ...flatExtends.map(ext => `${ext}(plugin, parser),`),
        flatConfigJson,
        '];',
      );
    } else {
      flatCode.push(
        docComment,
        `export default (_plugin: FlatConfig.Plugin, _parser: FlatConfig.Parser): FlatConfig.Config => (${flatConfigJson});`,
      );
    }
    const flatConfigStr = await prettier.format(flatCode.join('\n'), {
      parser: 'typescript',
      ...prettierConfig,
    });
    fs.writeFileSync(
      path.join(PACKAGES_ESLINT_PLUGIN, 'src', 'configs', 'flat', `${name}.ts`),
      flatConfigStr,
    );
  }

  interface ExtendedConfigSettings {
    description: string;
    name: string;
    ruleEntries: readonly RuleEntry[];
    settings?: ConfigRuleSettings;
  }

  async function writeExtendedConfig({
    description,
    name,
    ruleEntries,
    settings,
  }: ExtendedConfigSettings): Promise<void> {
    await writeConfig({
      description,
      getConfig: () => ({
        extends: [...CLASSIC_EXTENDS],
        rules: ruleEntries.reduce(
          (config, entry) => reducer(config, entry, settings),
          {},
        ),
      }),
      name,
    });
  }

  function filterRuleEntriesTo(
    ...recommendations: (RuleRecommendation | undefined)[]
  ): RuleEntry[] {
    return allRuleEntries.filter(([, rule]) =>
      typeof rule.meta.docs.recommended === 'object'
        ? Object.keys(rule.meta.docs.recommended).some(level =>
            recommendations.includes(level as RuleRecommendation),
          )
        : recommendations.includes(rule.meta.docs.recommended),
    );
  }

  function createGetOptionsForLevel(
    level: 'recommended' | 'strict',
  ): GetRuleOptions {
    return rule =>
      typeof rule.meta.docs.recommended === 'object'
        ? rule.meta.docs.recommended[level]
        : undefined;
  }

  await writeExtendedConfig({
    description:
      'Enables each the rules provided as a part of typescript-eslint. Note that many rules are not applicable in all codebases, or are meant to be configured.',
    name: 'all',
    ruleEntries: allRuleEntries,
    settings: {
      deprecated: 'exclude',
    },
  });

  await writeExtendedConfig({
    description:
      'Recommended rules for code correctness that you can drop in without additional configuration.',
    name: 'recommended',
    ruleEntries: filterRuleEntriesTo('recommended'),
    settings: {
      getOptions: createGetOptionsForLevel('recommended'),
      typeChecked: 'exclude',
    },
  });

  await writeExtendedConfig({
    description:
      'Contains all of `recommended` along with additional recommended rules that require type information.',
    name: 'recommended-type-checked',
    ruleEntries: filterRuleEntriesTo('recommended'),
    settings: {
      getOptions: createGetOptionsForLevel('recommended'),
    },
  });

  await writeExtendedConfig({
    description:
      'A version of `recommended` that only contains type-checked rules and disables of any corresponding core ESLint rules.',
    name: 'recommended-type-checked-only',
    ruleEntries: filterRuleEntriesTo('recommended'),
    settings: {
      getOptions: createGetOptionsForLevel('recommended'),
      typeChecked: 'include-only',
    },
  });

  await writeExtendedConfig({
    description:
      'Contains all of `recommended`, as well as additional strict rules that can also catch bugs. ',
    name: 'strict',
    ruleEntries: filterRuleEntriesTo('recommended', 'strict'),
    settings: {
      getOptions: createGetOptionsForLevel('strict'),
      typeChecked: 'exclude',
    },
  });

  await writeExtendedConfig({
    description:
      'Contains all of `recommended`, `recommended-type-checked`, and `strict`, along with additional strict rules that require type information.',
    name: 'strict-type-checked',
    ruleEntries: filterRuleEntriesTo('recommended', 'strict'),
    settings: {
      getOptions: createGetOptionsForLevel('strict'),
    },
  });

  await writeExtendedConfig({
    description:
      'A version of `strict` that only contains type-checked rules and disables of any corresponding core ESLint rules.',
    name: 'strict-type-checked-only',
    ruleEntries: filterRuleEntriesTo('recommended', 'strict'),
    settings: {
      getOptions: createGetOptionsForLevel('strict'),
      typeChecked: 'include-only',
    },
  });

  await writeExtendedConfig({
    description:
      'Rules considered to be best practice for modern TypeScript codebases, but that do not impact program logic.',
    name: 'stylistic',
    ruleEntries: filterRuleEntriesTo('stylistic'),
    settings: {
      typeChecked: 'exclude',
    },
  });

  await writeExtendedConfig({
    description:
      'Contains all of `stylistic`, along with additional stylistic rules that require type information.',
    name: 'stylistic-type-checked',
    ruleEntries: filterRuleEntriesTo('stylistic'),
  });

  await writeExtendedConfig({
    description:
      'A version of `stylistic` that only contains type-checked rules and disables of any corresponding core ESLint rules.',
    name: 'stylistic-type-checked-only',
    ruleEntries: filterRuleEntriesTo('stylistic'),
    settings: {
      typeChecked: 'include-only',
    },
  });

  await writeConfig({
    description:
      'A utility ruleset that will disable type-aware linting and all type-aware rules available in our project.',
    getConfig: () => ({
      parserOptions: {
        program: null,
        project: false,
        projectService: false,
      },
      rules: allRuleEntries.reduce(
        (config, entry) =>
          reducer(config, entry, {
            baseRuleForExtensionRule: 'exclude',
            forcedRuleLevel: 'off',
            typeChecked: 'include-only',
          }),
        {},
      ),
    }),
    name: 'disable-type-checked',
  });
}

main().catch((error: unknown) => {
  console.error(error);
});
