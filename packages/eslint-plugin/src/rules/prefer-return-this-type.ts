import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import { createRule, forEachReturnStatement, getParserServices } from '../util';

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
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      useThisType: 'Use `this` type instead.',
    },
    schema: [],
    fixable: 'code',
  },

  create(context) {
    const parserServices = getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function tryGetNameInType(
      name: string,
      typeNode: TSESTree.TypeNode,
    ): TSESTree.TSTypeReference | undefined {
      if (
        typeNode.type === AST_NODE_TYPES.TSTypeReference &&
        typeNode.typeName.type === AST_NODE_TYPES.Identifier &&
        typeNode.typeName.name === name
      ) {
        return typeNode;
      }

      if (typeNode.type === AST_NODE_TYPES.TSUnionType) {
        for (const type of typeNode.types) {
          const found = tryGetNameInType(name, type);
          if (found) {
            return found;
          }
        }
      }

      return undefined;
    }

    function isThisSpecifiedInParameters(originalFunc: FunctionLike): boolean {
      const firstArg = originalFunc.params[0];
      return (
        firstArg &&
        firstArg.type === AST_NODE_TYPES.Identifier &&
        firstArg.name === 'this'
      );
    }

    function isFunctionReturningThis(
      originalFunc: FunctionLike,
      originalClass: ClassLikeDeclaration,
    ): boolean {
      if (isThisSpecifiedInParameters(originalFunc)) {
        return false;
      }

      const func = parserServices.esTreeNodeToTSNodeMap.get(originalFunc);

      if (!func.body) {
        return false;
      }

      const classType = checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(originalClass),
      ) as ts.InterfaceType;

      if (func.body.kind !== ts.SyntaxKind.Block) {
        const type = checker.getTypeAtLocation(func.body);
        return classType.thisType === type;
      }

      let hasReturnThis = false;
      let hasReturnClassType = false;

      forEachReturnStatement(func.body as ts.Block, stmt => {
        const expr = stmt.expression;
        if (!expr) {
          return;
        }

        // fast check
        if (expr.kind === ts.SyntaxKind.ThisKeyword) {
          hasReturnThis = true;
          return;
        }

        const type = checker.getTypeAtLocation(expr);
        if (classType === type) {
          hasReturnClassType = true;
          return true;
        }

        if (classType.thisType === type) {
          hasReturnThis = true;
          return;
        }

        return;
      });

      return !hasReturnClassType && hasReturnThis;
    }

    function checkFunction(
      originalFunc: FunctionLike,
      originalClass: ClassLikeDeclaration,
    ): void {
      const className = originalClass.id?.name;
      if (!className || !originalFunc.returnType) {
        return;
      }

      const node = tryGetNameInType(
        className,
        originalFunc.returnType.typeAnnotation,
      );
      if (!node) {
        return;
      }

      if (isFunctionReturningThis(originalFunc, originalClass)) {
        context.report({
          node,
          messageId: 'useThisType',
          fix: fixer => fixer.replaceText(node, 'this'),
        });
      }
    }

    return {
      'ClassBody > MethodDefinition'(node: TSESTree.MethodDefinition): void {
        checkFunction(node.value, node.parent.parent as ClassLikeDeclaration);
      },
      'ClassBody > PropertyDefinition'(
        node: TSESTree.PropertyDefinition,
      ): void {
        if (
          !(
            node.value?.type === AST_NODE_TYPES.FunctionExpression ||
            node.value?.type === AST_NODE_TYPES.ArrowFunctionExpression
          )
        ) {
          return;
        }

        checkFunction(node.value, node.parent.parent as ClassLikeDeclaration);
      },
    };
  },
});
