import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { createRule, getParserServices } from '../util';
import * as ts from 'typescript';

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

    return {
      'ClassBody > MethodDefinition'(node: TSESTree.MethodDefinition): void {
        // nothing to do here
        if (
          !node.value.returnType ||
          node.value.returnType.typeAnnotation.type ===
            AST_NODE_TYPES.TSThisType
        ) {
          return;
        }

        const method = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (method.flags & ts.NodeFlags.HasImplicitReturn) {
          return;
        }

        const returnType = checker.getTypeAtLocation(method.type!);
        // if complex type is used explicitly, do not bother
        if (
          returnType.flags &
          (ts.TypeFlags.Any |
            ts.TypeFlags.Unknown |
            ts.TypeFlags.UnionOrIntersection)
        ) {
          return;
        }

        if (!method.body) {
          return;
        }

        let alwaysReturnsThis = true;

        const classLikeDec = checker.getTypeAtLocation(
          method.parent,
        ) as ts.InterfaceType;

        forEachReturnStatement(method.body, stmt => {
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
          if (classLikeDec.thisType !== type) {
            alwaysReturnsThis = false;
            return true;
          }

          return undefined;
        });

        if (alwaysReturnsThis) {
          context.report({
            node: node.value.returnType,
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
