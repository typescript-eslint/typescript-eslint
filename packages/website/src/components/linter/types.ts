import type { analyze, ScopeManager } from '@typescript-eslint/scope-manager';
import type { astConverter } from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import type { TSESTree } from '@typescript-eslint/utils';
import type {
  FlatConfig,
  Linter,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint';
import type esquery from 'esquery';
import type * as ts from 'typescript';

export type { ParseSettings } from '@typescript-eslint/typescript-estree/use-at-your-own-risk';

export interface UpdateModel {
  storedAST?: TSESTree.Program;
  storedScope?: ScopeManager;
  storedTsAST?: ts.Node;
  typeChecker?: ts.TypeChecker;
}

export interface WebLinterModule {
  analyze: typeof analyze;
  astConverter: typeof astConverter;
  configs: Record<string, FlatConfig.Config | FlatConfig.ConfigArray>;
  createLinter: () => Linter;
  esquery: typeof esquery;
  visitorKeys: SourceCode.VisitorKeys;
}

export type PlaygroundSystem = {
  removeFile: (fileName: string) => void;
  searchFiles: (path: string) => string[];
  getScriptFileNames: () => string[];
} & Required<Pick<ts.System, 'deleteFile' | 'watchFile'>> &
  ts.System;

export type LinterOnLint = (
  fileName: string,
  messages: Linter.LintMessage[],
) => void;

export type LinterOnParse = (fileName: string, model: UpdateModel) => void;

export type RegisterFile = (fileName: string, code: string) => void;
