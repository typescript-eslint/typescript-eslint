import type { analyze, ScopeManager } from '@typescript-eslint/scope-manager';
import type { astConverter } from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type esquery from 'esquery';
import type * as ts from 'typescript';

export type { ParseSettings } from '@typescript-eslint/typescript-estree/use-at-your-own-risk';

export interface UpdateModel {
  storedAST?: TSESTree.Program;
  storedTsAST?: ts.Node;
  storedScope?: ScopeManager;
  typeChecker?: ts.TypeChecker;
}

export interface WebLinterModule {
  createLinter: () => TSESLint.Linter;
  analyze: typeof analyze;
  visitorKeys: TSESLint.SourceCode.VisitorKeys;
  astConverter: typeof astConverter;
  esquery: typeof esquery;
  configs: Record<string, TSESLint.Linter.Config>;
}

export type PlaygroundSystem = ts.System &
  Required<Pick<ts.System, 'watchFile' | 'deleteFile'>> & {
    removeFile: (fileName: string) => void;
  };

export type LinterOnLint = (
  fileName: string,
  messages: TSESLint.Linter.LintMessage[],
) => void;

export type LinterOnParse = (fileName: string, model: UpdateModel) => void;
