/* eslint-disable @typescript-eslint/no-namespace */

import { TSESTree, ParserServices } from '@typescript-eslint/typescript-estree';
import { Linter as ESLintLinter } from 'eslint';
import { ParserOptions as TSParserOptions } from './ParserOptions';
import { RuleModule, RuleFix } from './Rule';
import { Scope } from './Scope';
import { SourceCode } from './SourceCode';

interface Linter {
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

  defineRule<TMessageIds extends string, TOptions extends readonly unknown[]>(
    name: string,
    rule: {
      meta?: RuleModule<TMessageIds, TOptions>['meta'];
      create: RuleModule<TMessageIds, TOptions>['create'];
    },
  ): void;

  defineRules<TMessageIds extends string, TOptions extends readonly unknown[]>(
    rules: Record<string, RuleModule<TMessageIds, TOptions>>,
  ): void;

  getRules<
    TMessageIds extends string,
    TOptions extends readonly unknown[]
  >(): Map<string, RuleModule<TMessageIds, TOptions>>;

  defineParser(name: string, parser: Linter.ParserModule): void;
}

namespace Linter {
  export type Severity = 0 | 1 | 2;
  export type RuleLevel = Severity | 'off' | 'warn' | 'error';

  export type RuleLevelAndOptions = [RuleLevel, ...unknown[]];

  export interface Config {
    rules?: {
      [name: string]: RuleLevel | RuleLevelAndOptions;
    };
    parser?: string;
    parserOptions?: ParserOptions;
    settings?: { [name: string]: unknown };
    env?: { [name: string]: boolean };
    globals?: { [name: string]: boolean };
  }

  export type ParserOptions = TSParserOptions;

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
        parse(text: string, options?: unknown): TSESTree.Program;
      }
    | {
        parseForESLint(text: string, options?: unknown): ESLintParseResult;
      };

  export interface ESLintParseResult {
    ast: TSESTree.Program;
    parserServices?: ParserServices;
    scopeManager?: Scope.ScopeManager;
    visitorKeys?: SourceCode.VisitorKeys;
  }
}

const Linter = ESLintLinter as {
  new (): Linter;
};

export { Linter };
