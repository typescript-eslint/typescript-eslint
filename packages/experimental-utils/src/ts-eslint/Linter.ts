/* eslint-disable @typescript-eslint/no-namespace, no-redeclare */

import { TSESTree, ParserServices } from '@typescript-eslint/typescript-estree';
import { RuleModule, RuleFix } from './Rule';
import { Scope } from './Scope';
import { SourceCode } from './SourceCode';

declare class Linter {
  version: string;

  verify(
    code: SourceCode | string,
    config: Linter.Config,
    filename?: string,
  ): Linter.LintMessage[];
  verify(
    code: SourceCode | string,
    config: Linter.Config,
    options: Linter.LintOptions,
  ): Linter.LintMessage[];

  verifyAndFix(
    code: string,
    config: Linter.Config,
    filename?: string,
  ): Linter.FixReport;
  verifyAndFix(
    code: string,
    config: Linter.Config,
    options: Linter.FixOptions,
  ): Linter.FixReport;

  getSourceCode(): SourceCode;

  defineRule<TMessageIds extends string, TOptions extends readonly any[]>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
  ): void;

  defineRules<TMessageIds extends string, TOptions extends readonly any[]>(
    rules: Record<string, RuleModule<TMessageIds, TOptions>>,
  ): void;

  getRules<TMessageIds extends string, TOptions extends readonly any[]>(): Map<
    string,
    RuleModule<TMessageIds, TOptions>
  >;

  defineParser(name: string, parser: Linter.ParserModule): void;
}

namespace Linter {
  export type Severity = 0 | 1 | 2;
  export type RuleLevel = Severity | 'off' | 'warn' | 'error';

  export interface RuleLevelAndOptions extends Array<any> {
    0: RuleLevel;
  }

  export interface Config {
    rules?: {
      [name: string]: RuleLevel | RuleLevelAndOptions;
    };
    parser?: string;
    parserOptions?: ParserOptions;
    settings?: { [name: string]: any };
    env?: { [name: string]: boolean };
    globals?: { [name: string]: boolean };
  }

  export interface ParserOptions {
    ecmaVersion?: 3 | 5 | 6 | 7 | 8 | 9 | 2015 | 2016 | 2017 | 2018;
    sourceType?: 'script' | 'module';
    ecmaFeatures?: {
      globalReturn?: boolean;
      impliedStrict?: boolean;
      jsx?: boolean;
      experimentalObjectRestSpread?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface LintOptions {
    filename?: string;
    preprocess?: (code: string) => string[];
    postprocess?: (problemLists: LintMessage[][]) => LintMessage[];
    allowInlineConfig?: boolean;
    reportUnusedDisableDirectives?: boolean;
  }

  export interface LintMessage {
    column: number;
    line: number;
    endColumn?: number;
    endLine?: number;
    ruleId: string | null;
    message: string;
    nodeType: string;
    fatal?: true;
    severity: Severity;
    fix?: RuleFix;
    source: string | null;
  }

  export interface FixOptions extends LintOptions {
    fix?: boolean;
  }

  export interface FixReport {
    fixed: boolean;
    output: string;
    messages: LintMessage[];
  }

  export type ParserModule =
    | {
        parse(text: string, options?: any): TSESTree.Program;
      }
    | {
        parseForESLint(text: string, options?: any): ESLintParseResult;
      };

  export interface ESLintParseResult {
    ast: TSESTree.Program;
    parserServices?: ParserServices;
    scopeManager?: Scope.ScopeManager;
    visitorKeys?: SourceCode.VisitorKeys;
  }
}

export { Linter };
