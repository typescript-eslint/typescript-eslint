import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import { createRule, forEachReturnStatement, getParserServices } from '../util';

export default createRule({
  name: 'no-extraneous-return-types',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow extraneous union types in return type annotations',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unusedReturnTypes:
        "Unused or redundant union type '{{type}}' in return type.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getRelevantReturnTypes(
      node: TSESTree.TypeNode,
      returnTypes: ts.Type[],
    ): ts.Type[] | null {
      const type = services.getTypeAtLocation(node);

      const relevantReturnTypes = returnTypes.filter(returnType =>
        checker.isTypeAssignableTo(returnType, type),
      );

      if (relevantReturnTypes.length === 0) {
        context.report({
          node,
          messageId: 'unusedReturnTypes',
          data: {
            type: checker.typeToString(type),
          },
        });

        return null;
      }

      return relevantReturnTypes;
    }

    function checkReturnType(
      node: TSESTree.TypeNode,
      returnTypes: ts.Type[],
    ): void {
      const tupleElementTypes = getTypeArgumentIfTupleNode(node);

      if (tupleElementTypes) {
        const relevantReturnTypes = getRelevantReturnTypes(node, returnTypes);

        if (relevantReturnTypes) {
          for (const [index, elementType] of tupleElementTypes.entries()) {
            const returnTypes = relevantReturnTypes
              .map(x => checker.getTypeArguments(x as ts.TupleTypeReference))
              .map(x => x[index])
              .flatMap(x => tsutils.unionTypeParts(x));

            checkReturnType(elementType, returnTypes);
          }
        }

        return;
      }

      const promiseTypeArgument = getTypeArgumentIfPromiseNode(node);

      if (promiseTypeArgument) {
        const relevantReturnTypes = getRelevantReturnTypes(node, returnTypes);

        if (relevantReturnTypes) {
          const returnTypes = relevantReturnTypes
            .map(x => checker.getAwaitedType(x))
            .filter(x => x != null)
            .flatMap(x => tsutils.unionTypeParts(x));

          checkReturnType(promiseTypeArgument, returnTypes);
        }
        return;
      }

      const arrayTypeArgument = getTypeArgumentIfArrayNode(node);

      if (arrayTypeArgument) {
        const relevantReturnTypes = getRelevantReturnTypes(node, returnTypes);

        if (relevantReturnTypes) {
          const returnTypes = relevantReturnTypes
            .map(x => checker.getTypeArguments(x as ts.TupleTypeReference)[0])
            .flatMap(x => tsutils.unionTypeParts(x));

          checkReturnType(arrayTypeArgument, returnTypes);
        }
        return;
      }

      if (node.type === AST_NODE_TYPES.TSUnionType) {
        for (const typeNode of node.types) {
          checkReturnType(typeNode, returnTypes);
        }

        return;
      }

      const declaredReturnType = services.getTypeAtLocation(node);

      // don't report on a potentially unused `void`, `any` or `undefined`
      // return type
      if (
        tsutils.isIntrinsicVoidType(declaredReturnType) ||
        tsutils.isIntrinsicUndefinedType(declaredReturnType) ||
        tsutils.isIntrinsicAnyType(declaredReturnType)
      ) {
        return;
      }

      const hasMatchingReturnStatement = returnTypes.some(actualReturnType => {
        return checker.isTypeAssignableTo(actualReturnType, declaredReturnType);
      });

      if (!hasMatchingReturnStatement) {
        context.report({
          node,
          messageId: 'unusedReturnTypes',
          data: {
            type: checker.typeToString(declaredReturnType),
          },
        });
      }

      return;
    }

    function getPotentialReturnTypes(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): ts.Type[] {
      if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
        return tsutils.typeParts(services.getTypeAtLocation(node.body));
      }

      const nodeTs = services.esTreeNodeToTSNodeMap.get(node);

      const returnTypes: ts.Type[] = [];

      forEachReturnStatement(nodeTs.body as ts.Block, statement => {
        const expression = statement.expression;

        // `return;`
        if (!expression) {
          returnTypes.push(checker.getUndefinedType());
          return;
        }

        const typeParts = tsutils.typeParts(
          checker.getTypeAtLocation(expression),
        );

        returnTypes.push(...typeParts);
      });

      return returnTypes;
    }

    return {
      'FunctionDeclaration,FunctionExpression,ArrowFunctionExpression'(
        node:
          | TSESTree.ArrowFunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression,
      ): void {
        if (!node.returnType || node.generator) {
          return;
        }

        const actualReturnTypes = getPotentialReturnTypes(node);

        if (actualReturnTypes.length === 0) {
          // this is a type error unless the return type includes `void`,
          // `undefined` or `any`
          return;
        }

        if (node.async) {
          const promiseTypeArgument = getTypeArgumentIfPromiseNode(
            node.returnType.typeAnnotation,
          );

          if (!promiseTypeArgument) {
            // this is a type error
            return;
          }

          const promiseReturnTypes = actualReturnTypes
            .map(x => checker.getAwaitedType(x))
            .filter(x => x != null)
            .flatMap(x => tsutils.unionTypeParts(x));

          checkReturnType(promiseTypeArgument, [
            // `async` functions may return promise and non-promise expressions
            ...actualReturnTypes,
            ...promiseReturnTypes,
          ]);

          return;
        }

        checkReturnType(node.returnType.typeAnnotation, actualReturnTypes);
      },
    };
  },
});

function getTypeArgumentIfPromiseNode(
  node: TSESTree.TypeNode,
): TSESTree.TypeNode | null {
  if (
    // Check for Promise<...> type reference
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === 'Promise' &&
    node.typeArguments?.params.length === 1
  ) {
    return node.typeArguments.params[0];
  }

  return null;
}

function getTypeArgumentIfArrayNode(
  node: TSESTree.TypeNode,
): TSESTree.TypeNode | null {
  if (
    // Check for Array<...> type reference
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === 'Array' &&
    node.typeArguments?.params.length === 1
  ) {
    return node.typeArguments.params[0];
  }

  if (
    // Check for (...)[]
    node.type === AST_NODE_TYPES.TSArrayType
  ) {
    return node.elementType;
  }

  return null;
}

function getTypeArgumentIfTupleNode(
  node: TSESTree.TypeNode,
): TSESTree.TypeNode[] | null {
  if (
    // Check for [...]
    node.type === AST_NODE_TYPES.TSTupleType &&
    node.elementTypes.length > 0
  ) {
    return node.elementTypes;
  }

  return null;
}
