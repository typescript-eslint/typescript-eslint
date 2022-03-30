import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { ParserOptions } from '@typescript-eslint/types';
import type { SourceFile, CompilerOptions } from 'typescript';

export type LintMessage = TSESLint.Linter.LintMessage;
export type RuleFix = TSESLint.RuleFix;
export type RulesRecord = TSESLint.Linter.RulesRecord;
export type RuleEntry = TSESLint.Linter.RuleEntry;

export interface WebLinter {
  ruleNames: { name: string; description?: string }[];

  getAst(): TSESTree.Program;
  getTsAst(): SourceFile;
  getScope(): Record<string, unknown>;

  lint(
    code: string,
    parserOptions: ParserOptions,
    rules?: RulesRecord,
  ): LintMessage[];
}

export interface LinterLoader {
  loadLinter(
    libMap: Map<string, string>,
    compilerOptions: CompilerOptions,
  ): WebLinter;
}

export type {
  DebugLevel,
  EcmaVersion,
  ParserOptions,
  SourceType,
  TSESTree,
} from '@typescript-eslint/types';
