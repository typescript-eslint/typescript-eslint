import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  forEachReturnStatement,
  forEachYieldExpression,
  getParserServices,
} from '../util';

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
      unusedGeneratorYieldTypes:
        "Unused or redundant yield type parameter, use 'unknown' instead.",
      unusedReturnTypes:
        "Unused or redundant union type '{{type}}' in return type.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getRelevantReturnTypesOrReport(
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

    function checkTypeReferenceReturnTypes(
      node: TSESTree.TypeNode,
      typeArguments: TSESTree.TypeNode[],
      returnTypes: ts.Type[],
    ): void {
      const relevantReturnTypes = getRelevantReturnTypesOrReport(
        node,
        returnTypes,
      );

      if (relevantReturnTypes) {
        for (const [index, typeParameter] of typeArguments.entries()) {
          const returnTypes: ts.Type[] = [];

          for (const type of relevantReturnTypes) {
            if (tsutils.isTypeReference(type) && type.typeArguments) {
              const returnTypePart = type.typeArguments[index];

              // if these don't match, this type reference or return value
              // may be unconventional
              if (
                !checker.isTypeAssignableTo(
                  returnTypePart,
                  services.getTypeAtLocation(typeParameter),
                )
              ) {
                return;
              }

              returnTypes.push(
                ...tsutils.unionTypeParts(type.typeArguments[index]),
              );
              continue;
            }

            // don't try to unbox this return type if it isn't an `any` or a
            // boxed value itself
            return;
          }

          checkReturnType(typeParameter, returnTypes);
        }
      }
    }

    function checkReturnType(
      node: TSESTree.TypeNode,
      returnTypes: ts.Type[],
      allowUnusedVoidOrUndefinedValues = false,
    ): void {
      // catch-all for generics including promises, maps, sets, and user-defined ones
      if (node.type === AST_NODE_TYPES.TSTypeReference && node.typeArguments) {
        checkTypeReferenceReturnTypes(
          node,
          node.typeArguments.params,
          returnTypes,
        );
        return;
      }

      // special-case for tuple structure `[A, B]`
      const tupleElementTypes = getTypeArgumentIfTupleNode(node);

      if (tupleElementTypes) {
        checkTypeReferenceReturnTypes(node, tupleElementTypes, returnTypes);
        return;
      }

      // special-case for non-generic array structure `A[]`
      const arrayTypeArgument = getTypeArgumentIfArrayNode(node);

      if (arrayTypeArgument) {
        checkTypeReferenceReturnTypes(node, [arrayTypeArgument], returnTypes);
        return;
      }

      if (node.type === AST_NODE_TYPES.TSUnionType) {
        for (const typeNode of node.types) {
          checkReturnType(
            typeNode,
            returnTypes,
            allowUnusedVoidOrUndefinedValues,
          );
        }

        return;
      }

      const declaredReturnType = services.getTypeAtLocation(node);

      const constrainedReturnType = tsutils.isTypeParameter(declaredReturnType)
        ? checker.getBaseConstraintOfType(declaredReturnType)
        : declaredReturnType;

      // treat unconstrained type parameters as `unknown` (matches everything)
      if (!constrainedReturnType) {
        return;
      }

      if (
        allowUnusedVoidOrUndefinedValues &&
        // don't report on a potentially unused `void` or `undefined` return type
        (tsutils.isIntrinsicVoidType(constrainedReturnType) ||
          tsutils.isIntrinsicUndefinedType(constrainedReturnType))
      ) {
        return;
      }

      const hasMatchingReturnStatement = returnTypes.some(actualReturnType => {
        return checker.isTypeAssignableTo(
          actualReturnType,
          constrainedReturnType,
        );
      });

      if (!hasMatchingReturnStatement) {
        context.report({
          node,
          messageId: 'unusedReturnTypes',
          data: {
            type: checker.typeToString(constrainedReturnType),
          },
        });
      }
    }

    function getActualReturnTypes(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): ts.Type[] {
      if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
        return tsutils.typeParts(services.getTypeAtLocation(node.body));
      }

      const returnTypes: ts.Type[] = [];

      const nodeTs = services.esTreeNodeToTSNodeMap.get(node);

      forEachReturnStatement(
        nodeTs.body as ts.Block,
        (statement: ts.ReturnStatement | ts.YieldExpression) => {
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
        },
      );

      return returnTypes;
    }

    function getActualYieldTypes(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): ts.Type[] {
      if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
        return tsutils.typeParts(services.getTypeAtLocation(node.body));
      }

      const returnTypes: ts.Type[] = [];

      const nodeTs = services.esTreeNodeToTSNodeMap.get(node);

      forEachYieldExpression(
        nodeTs.body as ts.Block,
        (statement: ts.ReturnStatement | ts.YieldExpression) => {
          const expression = statement.expression;

          // `yield;`
          if (!expression) {
            returnTypes.push(checker.getUndefinedType());
            return;
          }

          const typeParts = tsutils.typeParts(
            checker.getTypeAtLocation(expression),
          );

          returnTypes.push(...typeParts);
        },
      );

      return returnTypes;
    }

    function checkGeneratorFunction(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
      returnTypeAnnotation: TSESTree.TypeNode,
      actualReturnTypes: ts.Type[],
    ): void {
      const generatorTypeArguments =
        getTypeArgumentsIfGeneratorNode(returnTypeAnnotation);

      if (!generatorTypeArguments) {
        // no unused return types
        return;
      }

      const actualYieldTypes = getActualYieldTypes(node);

      // `Generator<YieldType, ReturnType, NexType>`
      const yieldTypeArgument = generatorTypeArguments.at(0);
      const returnTypeArgument = generatorTypeArguments.at(1);

      if (yieldTypeArgument) {
        checkYieldTypeArgument(
          actualYieldTypes,
          yieldTypeArgument,
          returnTypeArgument,
        );
      }

      if (returnTypeArgument && actualReturnTypes.length > 0) {
        checkReturnType(returnTypeArgument, actualReturnTypes);
      }
    }

    function checkYieldTypeArgument(
      actualYieldTypes: ts.Type[],
      yieldTypeArgument: TSESTree.TypeNode,
      returnTypeArgument: TSESTree.TypeNode | undefined,
    ): void {
      if (actualYieldTypes.length > 0) {
        checkReturnType(yieldTypeArgument, actualYieldTypes);
        return;
      }

      // the type can be omitted if there are no `yield` statements and no return
      // type argument
      if (!returnTypeArgument) {
        context.report({
          node: yieldTypeArgument,
          messageId: 'unusedReturnTypes',
          data: {
            type: checker.typeToString(
              services.getTypeAtLocation(yieldTypeArgument),
            ),
          },
        });
        return;
      }

      // the type can be replaced with `unknown` if it's ignored
      if (yieldTypeArgument.type !== AST_NODE_TYPES.TSUnknownKeyword) {
        context.report({
          node: yieldTypeArgument,
          messageId: 'unusedGeneratorYieldTypes',
        });
        return;
      }
    }

    function checkAsyncGeneratorFunction(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
      returnTypeAnnotation: TSESTree.TypeNode,
      actualReturnTypes: ts.Type[],
    ): void {
      const generatorTypeArguments =
        getTypeArgumentsIfAsyncGeneratorNode(returnTypeAnnotation);

      if (!generatorTypeArguments) {
        // no unused return types
        return;
      }

      const actualYieldTypes = getActualYieldTypes(node);

      // `AsyncGenerator<YieldType, ReturnType, NexType>`
      const yieldTypeArgument = generatorTypeArguments.at(0);
      const returnTypeArgument = generatorTypeArguments.at(1);

      if (yieldTypeArgument) {
        checkYieldTypeArgument(
          expandPromiseTypes(actualYieldTypes),
          yieldTypeArgument,
          returnTypeArgument,
        );
      }

      if (returnTypeArgument && actualReturnTypes.length > 0) {
        checkReturnType(
          returnTypeArgument,
          // `async` functions may return promise and non-promise expressions
          expandPromiseTypes(actualReturnTypes),
        );
      }
    }

    function checkAsyncFunction(
      returnTypeAnnotation: TSESTree.TypeNode,
      actualReturnTypes: ts.Type[],
    ): void {
      const promiseTypeArgument =
        getTypeArgumentIfPromiseNode(returnTypeAnnotation);

      if (!promiseTypeArgument) {
        // this is a type error
        return;
      }

      checkReturnType(
        promiseTypeArgument,
        // `async` functions may return promise and non-promise expressions
        expandPromiseTypes(actualReturnTypes),
        true,
      );
    }

    function expandPromiseTypes(types: ts.Type[]): ts.Type[] {
      const unboxedPromiseTypes = types
        .map(type => checker.getAwaitedType(type))
        .filter(type => type != null)
        .flatMap(type => tsutils.unionTypeParts(type));

      return [...types, ...unboxedPromiseTypes];
    }

    return {
      'FunctionDeclaration,FunctionExpression,ArrowFunctionExpression'(
        node:
          | TSESTree.ArrowFunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression,
      ): void {
        if (!node.returnType) {
          return;
        }

        const actualReturnTypes = getActualReturnTypes(node);

        if (node.generator) {
          if (node.async) {
            checkAsyncGeneratorFunction(
              node,
              node.returnType.typeAnnotation,
              actualReturnTypes,
            );
            return;
          }

          checkGeneratorFunction(
            node,
            node.returnType.typeAnnotation,
            actualReturnTypes,
          );
          return;
        }

        if (actualReturnTypes.length === 0) {
          // this is a type error unless the return type includes `void`,
          // `undefined` or `any`
          return;
        }

        if (node.async) {
          checkAsyncFunction(node.returnType.typeAnnotation, actualReturnTypes);
          return;
        }

        checkReturnType(
          node.returnType.typeAnnotation,
          actualReturnTypes,
          true,
        );
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

function getTypeArgumentsIfGeneratorNode(
  node: TSESTree.TypeNode,
): TSESTree.TypeNode[] | null {
  if (
    // Check for Generator<...> type reference
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === 'Generator' &&
    node.typeArguments &&
    node.typeArguments.params.length > 0
  ) {
    return node.typeArguments.params;
  }

  return null;
}

function getTypeArgumentsIfAsyncGeneratorNode(
  node: TSESTree.TypeNode,
): TSESTree.TypeNode[] | null {
  if (
    // Check for AsyncGenerator<...> type reference
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === 'AsyncGenerator' &&
    node.typeArguments &&
    node.typeArguments.params.length > 0
  ) {
    return node.typeArguments.params;
  }

  return null;
}

function getTypeArgumentIfArrayNode(
  node: TSESTree.TypeNode,
): TSESTree.TypeNode | null {
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
