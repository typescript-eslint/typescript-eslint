import type { TSESLint } from '@typescript-eslint/utils';

export type CompilerFlags = Record<string, unknown>;

export type SourceType = TSESLint.SourceType;

export type RulesRecord = TSESLint.Linter.RulesRecord;
export type RuleEntry = TSESLint.Linter.RuleEntry;

export interface RuleDetails {
  name: string;
  description?: string;
}

export interface ConfigModel {
  jsx?: boolean;
  sourceType?: SourceType;
  rules?: RulesRecord;
  tsConfig?: CompilerFlags;
  code: string;
  ts: string;
  showAST?: boolean | 'ts' | 'es' | 'scope';
}

export interface SelectedPosition {
  line: number;
  column: number;
}

export interface SelectedRange {
  start: SelectedPosition;
  end: SelectedPosition;
}
