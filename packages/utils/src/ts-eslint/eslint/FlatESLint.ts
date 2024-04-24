/* eslint-disable @typescript-eslint/no-namespace */
import { FlatESLint as ESLintFlatESLint } from 'eslint/use-at-your-own-risk';

import type { FlatConfig } from '../Config';
import type * as Shared from './ESLintShared';

declare class FlatESLintBase extends Shared.ESLintBase<
  FlatConfig.ConfigArray,
  FlatESLint.ESLintOptions
> {
  static readonly configType: 'flat';

  /**
   * Returns a configuration object for the given file based on the CLI options.
   * This is the same logic used by the ESLint CLI executable to determine
   * configuration for each file it processes.
   * @param filePath The path of the file to retrieve a config object for.
   * @returns A configuration object for the file or `undefined` if there is no configuration data for the object.
   */
  calculateConfigForFile(filePath: string): Promise<FlatConfig.ConfigArray>;

  /**
   * Finds the config file being used by this instance based on the options
   * passed to the constructor.
   * @returns The path to the config file being used or `undefined` if no config file is being used.
   */
  findConfigFile(): Promise<string | undefined>;
}

/**
 * The ESLint class is the primary class to use in Node.js applications.
 * This class depends on the Node.js fs module and the file system, so you cannot use it in browsers.
 *
 * If you want to lint code on browsers, use the Linter class instead.
 */
export class FlatESLint extends (ESLintFlatESLint as typeof FlatESLintBase) {}
export namespace FlatESLint {
  export interface ESLintOptions
    extends Shared.ESLintOptions<FlatConfig.ConfigArray> {
    /**
     * If false is present, the eslint.lintFiles() method doesn't respect `ignorePatterns` ignorePatterns in your configuration.
     * @default true
     */
    ignore?: boolean;
    /**
     * Ignore file patterns to use in addition to config ignores. These patterns are relative to cwd.
     * @default null
     */
    ignorePatterns?: string[] | null;
    /**
     * The path to a configuration file, overrides all configurations used with this instance.
     * The options.overrideConfig option is applied after this option is applied.
     * Searches for default config file when falsy; doesn't do any config file lookup when `true`; considered to be a config filename when a string.
     * @default false
     */
    overrideConfigFile?: string | boolean;
    /**
     * A predicate function that filters rules to be run.
     * This function is called with an object containing `ruleId` and `severity`, and returns `true` if the rule should be run.
     * @default () => true
     */
    ruleFilter?: RuleFilter;
    /**
     * When set to true, additional statistics are added to the lint results.
     * @see {@link https://eslint.org/docs/latest/extend/stats}
     * @default false
     */
    stats?: boolean;
    /**
     * Show warnings when the file list includes ignored files.
     * @default true
     */
    warnIgnored?: boolean;
  }
  export type DeprecatedRuleInfo = Shared.DeprecatedRuleInfo;
  export type EditInfo = Shared.EditInfo;
  export type Formatter = Shared.Formatter;
  export type LintMessage = Shared.LintMessage;
  export type LintResult = Shared.LintResult;
  export type LintStats = Shared.LintStats;
  export type LintStatsFixTime = Shared.LintStatsFixTime;
  export type LintStatsParseTime = Shared.LintStatsParseTime;
  export type LintStatsRuleTime = Shared.LintStatsRuleTime;
  export type LintStatsTimePass = Shared.LintStatsTimePass;
  export type LintTextOptions = Shared.LintTextOptions;
  export type SuppressedLintMessage = Shared.SuppressedLintMessage;
  export type RuleFilter = (rule: {
    ruleId: string;
    severity: number;
  }) => boolean;
}
