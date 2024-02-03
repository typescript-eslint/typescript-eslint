/* eslint-disable  @typescript-eslint/consistent-indexed-object-style,  @typescript-eslint/no-namespace */

import type { Parser as ParserType } from './Parser';
import type * as ParserOptionsTypes from './ParserOptions';
import type { Processor as ProcessorType } from './Processor';
import type {
  AnyRuleModule,
  RuleCreateFunction,
  SharedConfigurationSettings,
} from './Rule';

/** @internal */
export namespace SharedConfig {
  export type Severity = 0 | 1 | 2;
  export type SeverityString = 'error' | 'off' | 'warn';
  export type RuleLevel = Severity | SeverityString;

  export type RuleLevelAndOptions = [RuleLevel, ...unknown[]];

  export type RuleEntry = RuleLevel | RuleLevelAndOptions;
  export type RulesRecord = Partial<Record<string, RuleEntry>>;

  export type GlobalVariableOptionBase = 'off' | 'readonly' | 'writable';
  export type GlobalVariableOption = GlobalVariableOptionBase | boolean;

  export interface GlobalsConfig {
    [name: string]: GlobalVariableOption;
  }
  export interface EnvironmentConfig {
    [name: string]: boolean;
  }

  export type ParserOptions = ParserOptionsTypes.ParserOptions;

  export interface PluginMeta {
    /**
     * The meta.name property should match the npm package name for your plugin.
     */
    name: string;
    /**
     * The meta.version property should match the npm package version for your plugin.
     */
    version: string;
  }
}

export namespace ClassicConfig {
  export type EnvironmentConfig = SharedConfig.EnvironmentConfig;
  export type GlobalsConfig = SharedConfig.GlobalsConfig;
  export type GlobalVariableOption = SharedConfig.GlobalVariableOption;
  export type GlobalVariableOptionBase = SharedConfig.GlobalVariableOptionBase;
  export type ParserOptions = SharedConfig.ParserOptions;
  export type RuleEntry = SharedConfig.RuleEntry;
  export type RuleLevel = SharedConfig.RuleLevel;
  export type RuleLevelAndOptions = SharedConfig.RuleLevelAndOptions;
  export type RulesRecord = SharedConfig.RulesRecord;
  export type Severity = SharedConfig.Severity;
  export type SeverityString = SharedConfig.SeverityString;

  // https://github.com/eslint/eslintrc/blob/v2.1.0/conf/config-schema.js
  interface BaseConfig {
    $schema?: string;
    /**
     * The environment settings.
     */
    env?: EnvironmentConfig;
    /**
     * The path to other config files or the package name of shareable configs.
     */
    extends?: string[] | string;
    /**
     * The global variable settings.
     */
    globals?: GlobalsConfig;
    /**
     * The flag that disables directive comments.
     */
    noInlineConfig?: boolean;
    /**
     * The override settings per kind of files.
     */
    overrides?: ConfigOverride[];
    /**
     * The path to a parser or the package name of a parser.
     */
    parser?: string | null;
    /**
     * The parser options.
     */
    parserOptions?: ParserOptions;
    /**
     * The plugin specifiers.
     */
    plugins?: string[];
    /**
     * The processor specifier.
     */
    processor?: string;
    /**
     * The flag to report unused `eslint-disable` comments.
     */
    reportUnusedDisableDirectives?: boolean;
    /**
     * The rule settings.
     */
    rules?: RulesRecord;
    /**
     * The shared settings.
     */
    settings?: SharedConfigurationSettings;
  }

  export interface ConfigOverride extends BaseConfig {
    excludedFiles?: string[] | string;
    files: string[] | string;
  }

  export interface Config extends BaseConfig {
    /**
     * The glob patterns that ignore to lint.
     */
    ignorePatterns?: string[] | string;
    /**
     * The root flag.
     */
    root?: boolean;
  }
}

export namespace FlatConfig {
  export type EcmaVersion = ParserOptionsTypes.EcmaVersion;
  export type GlobalsConfig = SharedConfig.GlobalsConfig;
  export type Parser = ParserType.LooseParserModule;
  export type ParserOptions = SharedConfig.ParserOptions;
  export type PluginMeta = SharedConfig.PluginMeta;
  export type Processor = ProcessorType.ProcessorModule;
  export type RuleEntry = SharedConfig.RuleEntry;
  export type RuleLevel = SharedConfig.RuleLevel;
  export type RuleLevelAndOptions = SharedConfig.RuleLevelAndOptions;
  export type Rules = SharedConfig.RulesRecord;
  export type Settings = SharedConfigurationSettings;
  export type Severity = SharedConfig.Severity;
  export type SeverityString = SharedConfig.SeverityString;
  export type SourceType = ParserOptionsTypes.SourceType | 'commonjs';

  export interface SharedConfigs {
    [key: string]: Config;
  }
  export interface PluginMeta {
    /**
     * The meta.name property should match the npm package name for your plugin.
     */
    name: string;
    /**
     * The meta.version property should match the npm package version for your plugin.
     */
    version: string;
  }
  export interface Plugin {
    /**
     * Shared configurations bundled with the plugin.
     * Users will reference these directly in their config (i.e. `plugin.configs.recommended`).
     */
    configs?: SharedConfigs;
    /**
     * Metadata about your plugin for easier debugging and more effective caching of plugins.
     */
    meta?: PluginMeta;
    /**
     * The definition of plugin processors.
     * Users can stringly reference the processor using the key in their config (i.e., `"pluginName/processorName"`).
     */
    processors?: Record<string, Processor>;
    /**
     * The definition of plugin rules.
     * The key must be the name of the rule that users will use
     * Users can stringly reference the rule using the key they registered the plugin under combined with the rule name.
     * i.e. for the user config `plugins: { foo: pluginReference }` - the reference would be `"foo/ruleName"`.
     */
    rules?: Record<string, RuleCreateFunction | AnyRuleModule>;
  }
  export interface Plugins {
    /**
     * We intentionally omit the `configs` key from this object because it avoids
     * type conflicts with old plugins that haven't updated their configs to flat configs yet.
     * It's valid to reference these old plugins because ESLint won't access the
     * `.config` property of a plugin when evaluating a flat config.
     */
    [pluginAlias: string]: Omit<Plugin, 'configs'>;
  }

  export interface LinterOptions {
    /**
     * A Boolean value indicating if inline configuration is allowed.
     */
    noInlineConfig?: boolean;
    /**
     * A severity string indicating if and how unused disable and enable
     * directives should be tracked and reported. For legacy compatibility, `true`
     * is equivalent to `"warn"` and `false` is equivalent to `"off"`.
     * @default "off"
     *
     * non-boolean values @since 8.56.0
     */
    reportUnusedDisableDirectives?:
      | SharedConfig.Severity
      | SharedConfig.SeverityString
      | boolean;
  }

  export interface LanguageOptions {
    /**
     * The version of ECMAScript to support.
     * May be any year (i.e., `2022`) or version (i.e., `5`).
     * Set to `"latest"` for the most recent supported version.
     * @default "latest"
     */
    ecmaVersion?: EcmaVersion;
    /**
     * An object specifying additional objects that should be added to the global scope during linting.
     */
    globals?: GlobalsConfig;
    /**
     * An object containing a `parse()` method or a `parseForESLint()` method.
     * @default
     * ```
     * // https://github.com/eslint/espree
     * require('espree')
     * ```
     */
    parser?: Parser;
    /**
     * An object specifying additional options that are passed directly to the parser.
     * The available options are parser-dependent.
     */
    parserOptions?: ParserOptions;
    /**
     * The type of JavaScript source code.
     * Possible values are `"script"` for traditional script files, `"module"` for ECMAScript modules (ESM), and `"commonjs"` for CommonJS files.
     * @default
     * ```
     * // for `.js` and `.mjs` files
     * "module"
     * // for `.cjs` files
     * "commonjs"
     * ```
     */
    sourceType?: SourceType;
  }

  // it's not a json schema so it's nowhere near as nice to read and convert...
  // https://github.com/eslint/eslint/blob/v8.45.0/lib/config/flat-config-schema.js
  export interface Config {
    /**
     * An array of glob patterns indicating the files that the configuration object should apply to.
     * If not specified, the configuration object applies to all files matched by any other configuration object.
     */
    files?: string[];
    /**
     * An array of glob patterns indicating the files that the configuration object should not apply to.
     * If not specified, the configuration object applies to all files matched by files.
     */
    ignores?: string[];
    /**
     * An object containing settings related to how JavaScript is configured for linting.
     */
    languageOptions?: LanguageOptions;
    /**
     * An object containing settings related to the linting process.
     */
    linterOptions?: LinterOptions;
    /**
     * An object containing a name-value mapping of plugin names to plugin objects.
     * When `files` is specified, these plugins are only available to the matching files.
     */
    plugins?: Plugins;
    /**
     * Either an object containing `preprocess()` and `postprocess()` methods or
     * a string indicating the name of a processor inside of a plugin
     * (i.e., `"pluginName/processorName"`).
     */
    processor?: string | Processor;
    /**
     * An object containing the configured rules.
     * When `files` or `ignores` are specified, these rule configurations are only available to the matching files.
     */
    rules?: Rules;
    /**
     * An object containing name-value pairs of information that should be available to all rules.
     */
    settings?: Settings;
  }
  export type ConfigArray = Config[];
  export type ConfigPromise = Promise<ConfigArray>;
  export type ConfigFile = ConfigArray | ConfigPromise;
}
