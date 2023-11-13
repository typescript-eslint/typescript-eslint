import type { analyze, ScopeManager } from '@typescript-eslint/scope-manager';
import type { astConverter } from '@typescript-eslint/typescript-estree/use-at-your-own-risk';
import type { TSESTree } from '@typescript-eslint/utils';
import type {
  ClassicConfig,
  Linter,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint';
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
  createLinter: () => Linter;
  analyze: typeof analyze;
  visitorKeys: SourceCode.VisitorKeys;
  astConverter: typeof astConverter;
  esquery: typeof esquery;
  configs: Record<string, ClassicConfig.Config>;
}

export type PlaygroundSystem = Required<
  Pick<ts.System, 'deleteFile' | 'watchFile'>
> &
  ts.System & {
    removeFile: (fileName: string) => void;
  };

export type LinterOnLint = (
  fileName: string,
  messages: Linter.LintMessage[],
) => void;

export type LinterOnParse = (fileName: string, model: UpdateModel) => void;
