/* eslint-disable @typescript-eslint/no-namespace */

import { CLIEngine as ESLintCLIEngine } from 'eslint';
import { Linter } from './Linter';
import { RuleModule, RuleListener } from './Rule';

interface CLIEngine {
  version: string;

  executeOnFiles(patterns: string[]): CLIEngine.LintReport;

  resolveFileGlobPatterns(patterns: string[]): string[];

  getConfigForFile(filePath: string): Linter.Config;

  executeOnText(text: string, filename?: string): CLIEngine.LintReport;

  addPlugin(name: string, pluginObject: unknown): void;

  isPathIgnored(filePath: string): boolean;

  getFormatter(format?: string): CLIEngine.Formatter;

  getRules<
    TMessageIds extends string = string,
    TOptions extends readonly unknown[] = unknown[],
    // for extending base rules
    TRuleListener extends RuleListener = RuleListener
  >(): Map<string, RuleModule<TMessageIds, TOptions, TRuleListener>>;
}

namespace CLIEngine {
  export interface Options {
    allowInlineConfig?: boolean;
    baseConfig?: false | { [name: string]: unknown };
    cache?: boolean;
    cacheFile?: string;
    cacheLocation?: string;
    configFile?: string;
    cwd?: string;
    envs?: string[];
    extensions?: string[];
    fix?: boolean;
    globals?: string[];
    ignore?: boolean;
    ignorePath?: string;
    ignorePattern?: string | string[];
    useEslintrc?: boolean;
    parser?: string;
    parserOptions?: Linter.ParserOptions;
    plugins?: string[];
    rules?: {
      [name: string]: Linter.RuleLevel | Linter.RuleLevelAndOptions;
    };
    rulePaths?: string[];
    reportUnusedDisableDirectives?: boolean;
  }

  export interface LintResult {
    filePath: string;
    messages: Linter.LintMessage[];
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    output?: string;
    source?: string;
  }

  export interface LintReport {
    results: LintResult[];
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
  }

  export type Formatter = (results: LintResult[]) => string;
}

const CLIEngine = ESLintCLIEngine as {
  new (options: CLIEngine.Options): CLIEngine;

  // static methods
  getErrorResults(results: CLIEngine.LintResult[]): CLIEngine.LintResult[];

  outputFixes(report: CLIEngine.LintReport): void;
};

export { CLIEngine };
