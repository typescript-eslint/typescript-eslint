import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { createRule, getParserServices } from '../util';
import * as ts from 'typescript';

const IgnoreTypes = new Set<TSESTree.TypeNode['type']>([
  AST_NODE_TYPES.TSThisType,
  AST_NODE_TYPES.TSAnyKeyword,
  AST_NODE_TYPES.TSUnknownKeyword,
  AST_NODE_TYPES.TSNeverKeyword,
  AST_NODE_TYPES.TSUnionType,
  AST_NODE_TYPES.TSIntersectionType,
]);

type ClassLikeDeclaration =
  | TSESTree.ClassDeclaration
  | TSESTree.ClassExpression;

export default createRule({
  name: 'prefer-return-this-type',
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that `this` is used when only `this` type is returned',
      category: 'Best Practices',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      UseThisType: 'use `this` type instead.',
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    const parserServices = getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    // If returnType is absent or complex, do not bother
    function isReturnTypePossiblyUnconcise(
      func: TSESTree.FunctionLike,
    ): boolean {
      return (
        !!func.returnType &&
        !IgnoreTypes.has(func.returnType.typeAnnotation.type)
      );
    }

    function isFunctionAlwaysReturningThis(
      originalFunc:
        | TSESTree.MethodDefinition['value']
        | TSESTree.ArrowFunctionExpression,
      originalClass: ClassLikeDeclaration,
    ): boolean {
      const func = parserServices.esTreeNodeToTSNodeMap.get(originalFunc);

      if (func.flags & ts.NodeFlags.HasImplicitReturn || !func.body) {
        return false;
      }

      const classType = checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(originalClass),
      ) as ts.InterfaceType;

      if (func.body.kind !== ts.SyntaxKind.Block) {
        const type = checker.getTypeAtLocation(func.body);
        return classType.thisType === type;
      }

      let alwaysReturnsThis = true;

      forEachReturnStatement(func.body as ts.Block, stmt => {
        const expr = stmt.expression;
        if (!expr) {
          alwaysReturnsThis = false;
          return true;
        }

        // fast check
        if (expr.kind === ts.SyntaxKind.ThisKeyword) {
          return;
        }

        const type = checker.getTypeAtLocation(expr);
        if (classType.thisType !== type) {
          alwaysReturnsThis = false;
          return true;
        }

        return undefined;
      });

      return alwaysReturnsThis;
    }

    return {
      'ClassBody > MethodDefinition'(node: TSESTree.MethodDefinition): void {
        if (!isReturnTypePossiblyUnconcise(node.value)) {
          return;
        }

        if (
          isFunctionAlwaysReturningThis(
            node.value,
            node.parent!.parent as ClassLikeDeclaration,
          )
        ) {
          context.report({
            node: node.value.returnType!,
            messageId: 'UseThisType',
            fix(fixer) {
              return fixer.replaceText(
                node.value.returnType!.typeAnnotation,
                'this',
              );
            },
          });
        }
      },
      'ClassBody > ClassProperty'(node: TSESTree.ClassProperty): void {
        if (
          !(
            node.value?.type === AST_NODE_TYPES.FunctionExpression ||
            node.value?.type === AST_NODE_TYPES.ArrowFunctionExpression
          )
        ) {
          return;
        }

        if (!isReturnTypePossiblyUnconcise(node.value)) {
          return;
        }

        if (
          isFunctionAlwaysReturningThis(
            node.value,
            node.parent!.parent as ClassLikeDeclaration,
          )
        ) {
          context.report({
            node: node.value.returnType!,
            messageId: 'UseThisType',
            fix(fixer) {
              return fixer.replaceText(
                (node.value as TSESTree.FunctionLike).returnType!
                  .typeAnnotation,
                'this',
              );
            },
          });
        }
      },
    };
  },
});

// Copied from typescript https://github.com/microsoft/TypeScript/blob/42b0e3c4630c129ca39ce0df9fff5f0d1b4dd348/src/compiler/utilities.ts#L1335
// Warning: This has the same semantics as the forEach family of functions,
//          in that traversal terminates in the event that 'visitor' supplies a truthy value.
export function forEachReturnStatement<T>(
  body: ts.Block,
  visitor: (stmt: ts.ReturnStatement) => T,
): T | undefined {
  return traverse(body);

  function traverse(node: ts.Node): T | undefined {
    switch (node.kind) {
      case ts.SyntaxKind.ReturnStatement:
        return visitor(<ts.ReturnStatement>node);
      case ts.SyntaxKind.CaseBlock:
      case ts.SyntaxKind.Block:
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.WithStatement:
      case ts.SyntaxKind.SwitchStatement:
      case ts.SyntaxKind.CaseClause:
      case ts.SyntaxKind.DefaultClause:
      case ts.SyntaxKind.LabeledStatement:
      case ts.SyntaxKind.TryStatement:
      case ts.SyntaxKind.CatchClause:
        return ts.forEachChild(node, traverse);
    }

    return undefined;
  }
}
