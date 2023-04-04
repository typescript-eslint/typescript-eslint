import type { ScopeManager } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

export interface ASTModel {
  storedAST?: TSESTree.Program;
  storedTsAST?: ts.Node;
  storedScope?: ScopeManager;
  typeChecker?: ts.TypeChecker;
}
