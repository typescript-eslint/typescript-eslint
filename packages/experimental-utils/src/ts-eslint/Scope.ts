/* eslint-disable @typescript-eslint/no-namespace */

import { TSESTree } from '@typescript-eslint/typescript-estree';

namespace Scope {
  export interface ScopeManager {
    scopes: Scope[];
    globalScope: Scope | null;

    acquire(node: TSESTree.Node, inner?: boolean): Scope | null;

    getDeclaredVariables(node: TSESTree.Node): Variable[];
  }

  export interface Reference {
    identifier: TSESTree.Identifier;
    from: Scope;
    resolved: Variable | null;
    writeExpr: TSESTree.Node | null;
    init: boolean;

    isWrite(): boolean;

    isRead(): boolean;

    isWriteOnly(): boolean;

    isReadOnly(): boolean;

    isReadWrite(): boolean;
  }

  export interface Variable {
    name: string;
    identifiers: TSESTree.Identifier[];
    references: Reference[];
    defs: Definition[];
    scope: Scope;
    eslintUsed?: boolean;
  }

  export interface Scope {
    type:
      | 'block'
      | 'catch'
      | 'class'
      | 'for'
      | 'function'
      | 'function-expression-name'
      | 'global'
      | 'module'
      | 'switch'
      | 'with'
      | 'TDZ';
    isStrict: boolean;
    upper: Scope | null;
    childScopes: Scope[];
    variableScope: Scope;
    block: TSESTree.Node;
    variables: Variable[];
    set: Map<string, Variable>;
    references: Reference[];
    through: Reference[];
    functionExpressionScope: boolean;
  }

  export type DefinitionType =
    | {
        // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
        type: 'CatchClause';
        node: TSESTree.CatchClause;
        parent: null;
      }
    | {
        type: 'ClassName';
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression;
        parent: null;
      }
    | {
        type: 'FunctionName';
        node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression;
        parent: null;
      }
    | { type: 'ImplicitGlobalVariable'; node: TSESTree.Program; parent: null }
    | {
        type: 'ImportBinding';
        node:
          | TSESTree.ImportSpecifier
          | TSESTree.ImportDefaultSpecifier
          | TSESTree.ImportNamespaceSpecifier;
        parent: TSESTree.ImportDeclaration;
      }
    | {
        type: 'Parameter';
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.ArrowFunctionExpression;
        parent: null;
      }
    | { type: 'TDZ'; node: unknown; parent: null }
    | {
        type: 'Variable';
        node: TSESTree.VariableDeclarator;
        parent: TSESTree.VariableDeclaration;
      };

  export type Definition = DefinitionType & { name: TSESTree.Identifier };
}

export { Scope };
