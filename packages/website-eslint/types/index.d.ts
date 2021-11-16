import type { TSESLint } from '@typescript-eslint/experimental-utils';
import type { ParserOptions } from '@typescript-eslint/types';

export type LintMessage = TSESLint.Linter.LintMessage;
export type RuleFix = TSESLint.RuleFix;
export type RulesRecord = TSESLint.Linter.RulesRecord;
export type RuleEntry = TSESLint.Linter.RuleEntry;
export type ParseForESLintResult = TSESLint.Linter.ESLintParseResult;
export type ESLintAST = ParseForESLintResult['ast'];

export interface WebLinter {
  ruleNames: string[];

  getAst(): ESLintAST;

  lint(
    code: string,
    parserOptions: ParserOptions,
    rules?: RulesRecord,
  ): LintMessage[];
}

export type { TSESTree } from '@typescript-eslint/types';

export type {
  DebugLevel,
  EcmaVersion,
  ParserOptions,
  SourceType,
} from '@typescript-eslint/types';
