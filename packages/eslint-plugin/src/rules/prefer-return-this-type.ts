import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { createRule, forEachReturnStatement, getParserServices } from '../util';
import * as ts from 'typescript';

const IgnoreTypes = new Set<TSESTree.TypeNode['type']>([
  AST_NODE_TYPES.TSThisType,
  AST_NODE_TYPES.TSAnyKeyword,
  AST_NODE_TYPES.TSUnknownKeyword,
]);

type ClassLikeDeclaration =
  | TSESTree.ClassDeclaration
  | TSESTree.ClassExpression;

type FunctionLike =
  | TSESTree.MethodDefinition['value']
  | TSESTree.ArrowFunctionExpression;

export default createRule({
  name: 'prefer-return-this-type',
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that `this` is used when only `this` type is returned',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      useThisType: 'use `this` type instead.',
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    const parserServices = getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function isThisSpecifiedInParameters(originalFunc: FunctionLike): boolean {
      const firstArg = originalFunc.params[0];
      return (
        firstArg &&
        firstArg.type === AST_NODE_TYPES.Identifier &&
        firstArg.name === 'this'
      );
    }

    function isFunctionAlwaysReturningThis(
      originalFunc: FunctionLike,
      originalClass: ClassLikeDeclaration,
    ): boolean {
      if (isThisSpecifiedInParameters(originalFunc)) {
        return false;
      }

      const func = parserServices.esTreeNodeToTSNodeMap.get(originalFunc);

      // two things to note here:
      // 1. arrow function without brackets is flagged as HasImplicitReturn by ts.
      // 2. ts.NodeFlags.HasImplicitReturn is not accurate. TypeScript compiler uses control flow
      //    analysis to determine if a function has implicit return.
      const hasImplicitReturn =
        func.flags & ts.NodeFlags.HasImplicitReturn &&
        !(
          func.kind === ts.SyntaxKind.ArrowFunction &&
          func.body?.kind !== ts.SyntaxKind.Block
        );

      if (hasImplicitReturn || !func.body) {
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
      let hasReturnStatements = false;

      forEachReturnStatement(func.body as ts.Block, stmt => {
        hasReturnStatements = true;

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

      return hasReturnStatements && alwaysReturnsThis;
    }

    function checkFunction(
      originalFunc: FunctionLike,
      originalClass: ClassLikeDeclaration,
    ): void {
      if (
        !originalFunc.returnType ||
        IgnoreTypes.has(originalFunc.returnType.typeAnnotation.type)
      ) {
        return;
      }

      if (isFunctionAlwaysReturningThis(originalFunc, originalClass)) {
        context.report({
          node: originalFunc.returnType,
          messageId: 'UseThisType',
          fix(fixer) {
            return fixer.replaceText(
              originalFunc.returnType!.typeAnnotation,
              'this',
            );
          },
        });
      }
    }

    return {
      'ClassBody > MethodDefinition'(node: TSESTree.MethodDefinition): void {
        checkFunction(node.value, node.parent!.parent as ClassLikeDeclaration);
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

        checkFunction(node.value, node.parent!.parent as ClassLikeDeclaration);
      },
    };
  },
});
