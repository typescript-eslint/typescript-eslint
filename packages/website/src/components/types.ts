import type { TSESLint } from '@typescript-eslint/utils';
import type * as ESQuery from 'esquery';
import type * as ts from 'typescript';

export type CompilerFlags = Record<string, unknown>;

export type SourceType = TSESLint.SourceType;

export type RulesRecord = TSESLint.Linter.RulesRecord;

export interface RuleDetails {
  description?: string;
  name: string;
  url?: string;
}

export type TabType = 'code' | 'eslintrc' | 'tsconfig';

export type ConfigFileType = `${ts.Extension}`;

export type ConfigShowAst = 'es' | 'scope' | 'ts' | 'types' | false;

export interface ConfigModel {
  code: string;
  eslintrc: string;
  esQuery?: {
    filter?: string;
    selector: ESQuery.Selector;
  };
  fileType?: ConfigFileType;
  scroll?: boolean;
  showAST?: ConfigShowAst;
  showTokens?: boolean;
  sourceType?: SourceType;
  ts: string;
  tsconfig: string;
}

export type SelectedRange = [number, number];

export interface ErrorFix {
  edit: {
    range: Readonly<[number, number]>;
    text: string;
  };
  fix(): void;
  message: string;
  originalText?: string;
}

export interface ErrorItem {
  fixer?: ErrorFix;
  location?: string;
  message: string;
  severity: number;
  suggestions?: ErrorFix[];
}

export interface ErrorGroup {
  group: string;
  items: ErrorItem[];
  uri?: string;
}

export interface EslintRC {
  rules: RulesRecord;
  extends: string[];
}
export type TSConfig = {
  compilerOptions: CompilerFlags;
} & Record<string, unknown>;
