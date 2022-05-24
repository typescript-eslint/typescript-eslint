import type {
  ParserOptions,
  RulesRecord,
} from '@typescript-eslint/website-eslint';

export type CompilerFlags = Record<string, unknown>;

export type SourceType = ParserOptions['sourceType'];

export type { RulesRecord } from '@typescript-eslint/website-eslint';

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

export interface ErrorItem {
  group: string;
  message: string;
  location: string;
  severity: number;
  hasFixers: boolean;
  fixers: { message: string; fix(): void }[];
}
