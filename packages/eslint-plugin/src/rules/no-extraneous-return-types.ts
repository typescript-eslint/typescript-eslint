import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  forEachReturnStatement,
  forEachYieldExpression,
  getParserServices,
  isFunction,
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

    function removeTypeAnnotation(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Node,
    ) {
      const beforeToken = context.sourceCode.getTokenBefore(node, {
        filter: token =>
          token.value === '|' || token.value === '[' || token.value === '<',
      });

      if (beforeToken?.value === '|') {
        return fixer.removeRange([beforeToken.range[0], node.range[1]]);
      }

      const afterToken = context.sourceCode.getTokenAfter(node, {
        filter: token => token.value === '|',
      });

      if (afterToken?.value === '|') {
        return fixer.removeRange([node.range[0], afterToken.range[1]]);
      }

      return fixer.remove(node);
    }

    function reportAndRemoveUnusedReturnTypes(
      node: TSESTree.TypeNode,
      type: ts.Type,
    ) {
      const canFix = !isFunction(node.parent.parent);

      context.report({
        node,
        messageId: 'unusedReturnTypes',
        data: {
          type: checker.typeToString(type),
        },
        fix: canFix ? fixer => removeTypeAnnotation(fixer, node) : null,
      });
    }

    function getRelevantReturnTypesOrReport(
      node: TSESTree.TypeNode,
      returnTypes: ts.Type[],
    ): ts.Type[] | undefined {
      const type = services.getTypeAtLocation(node);

      const relevantReturnTypes = returnTypes.filter(returnType =>
        checker.isTypeAssignableTo(returnType, type),
      );

      if (relevantReturnTypes.length === 0) {
        reportAndRemoveUnusedReturnTypes(node, type);
        return;
      }

      return relevantReturnTypes;
    }

    function checkTypeReferenceReturnType(
      node: TSESTree.TypeNode,
      typeArguments: TSESTree.TypeNode[],
      returnTypes: ts.Type[],
    ): void {
      const relevantReturnTypes = getRelevantReturnTypesOrReport(
        node,
        returnTypes,
      );

      if (!relevantReturnTypes) {
        return;
      }

      for (const [index, typeParameter] of typeArguments.entries()) {
        const returnTypes: ts.Type[] = [];

        const typeParameterType = services.getTypeAtLocation(typeParameter);

        for (const returnType of relevantReturnTypes) {
          if (
            !tsutils.isTypeReference(returnType) ||
            !returnType.typeArguments
          ) {
            // assume the whole type reference return type as used, as we can't
            // safely compare its boxed value
            return;
          }

          const returnTypePart = returnType.typeArguments[index];

          if (!checker.isTypeAssignableTo(returnTypePart, typeParameterType)) {
            // assume the whole type reference return type as used, as we don't
            // know how to compare the two types
            return;
          }

          returnTypes.push(
            ...tsutils.unionTypeParts(returnType.typeArguments[index]),
          );
        }

        checkReturnType(typeParameter, returnTypes);
      }
    }

    function checkReturnType(
      node: TSESTree.TypeNode,
      returnTypes: ts.Type[],
      allowUnusedVoidOrUndefinedValues = false,
    ): void {
      if (node.type === AST_NODE_TYPES.TSTypeReference && node.typeArguments) {
        checkTypeReferenceReturnType(
          node,
          node.typeArguments.params,
          returnTypes,
        );
        return;
      }

      const tupleElementTypes = getTypeArgumentIfTupleNode(node);

      if (tupleElementTypes) {
        checkTypeReferenceReturnType(node, tupleElementTypes, returnTypes);
        return;
      }

      const arrayTypeArgument = getTypeArgumentIfArrayNode(node);

      if (arrayTypeArgument) {
        checkTypeReferenceReturnType(node, [arrayTypeArgument], returnTypes);
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
        reportAndRemoveUnusedReturnTypes(node, constrainedReturnType);
      }
    }

    function collectTypeParts(
      body: TSESTree.BlockStatement,
      forEachIterator: <T>(
        body: ts.Block,
        visitor: (stmt: ts.ReturnStatement | ts.YieldExpression) => T,
      ) => T | undefined,
    ): ts.Type[] {
      const typeParts: ts.Type[] = [];

      const bodyTs = services.esTreeNodeToTSNodeMap.get(body);

      forEachIterator(bodyTs, statement => {
        const expression = statement.expression;

        // no value: `return;` or `yield;`
        if (!expression) {
          typeParts.push(checker.getUndefinedType());
          return;
        }

        typeParts.push(
          ...tsutils.typeParts(checker.getTypeAtLocation(expression)),
        );
      });

      return typeParts;
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

      return collectTypeParts(node.body, forEachReturnStatement);
    }

    function getActualYieldTypes(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): ts.Type[] {
      if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
        return [];
      }

      return collectTypeParts(node.body, forEachYieldExpression);
    }

    function checkGeneratorFunction(
      returnTypeAnnotation: TSESTree.TypeNode,
      actualReturnTypes: ts.Type[],
      actualYieldTypes: ts.Type[],
    ): void {
      const generatorTypeArguments = getTypeArgumentsForTypeName(
        'Generator',
        returnTypeAnnotation,
      );

      if (!generatorTypeArguments) {
        return;
      }

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

    function checkAsyncGeneratorFunction(
      returnTypeAnnotation: TSESTree.TypeNode,
      actualReturnTypes: ts.Type[],
      actualYieldTypes: ts.Type[],
    ): void {
      const generatorTypeArguments = getTypeArgumentsForTypeName(
        'AsyncGenerator',
        returnTypeAnnotation,
      );

      if (!generatorTypeArguments) {
        return;
      }

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
          expandPromiseTypes(actualReturnTypes),
        );
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

      if (!returnTypeArgument) {
        context.report({
          node: yieldTypeArgument.parent,
          messageId: 'unusedReturnTypes',
          data: {
            type: checker.typeToString(
              services.getTypeAtLocation(yieldTypeArgument),
            ),
          },
          fix: fixer => fixer.remove(yieldTypeArgument.parent),
        });
        return;
      }

      if (yieldTypeArgument.type !== AST_NODE_TYPES.TSUnknownKeyword) {
        context.report({
          node: yieldTypeArgument,
          messageId: 'unusedGeneratorYieldTypes',
          fix: fixer => fixer.replaceText(yieldTypeArgument, 'unknown'),
        });
        return;
      }
    }

    function checkAsyncFunction(
      returnTypeAnnotation: TSESTree.TypeNode,
      actualReturnTypes: ts.Type[],
    ): void {
      const promiseTypeArgument = getTypeArgumentsForTypeName(
        'Promise',
        returnTypeAnnotation,
      );

      if (!promiseTypeArgument) {
        // this is a type error
        return;
      }

      checkReturnType(
        promiseTypeArgument[0],
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
          const actualYieldTypes = getActualYieldTypes(node);

          if (node.async) {
            checkAsyncGeneratorFunction(
              node.returnType.typeAnnotation,
              actualReturnTypes,
              actualYieldTypes,
            );
            return;
          }

          checkGeneratorFunction(
            node.returnType.typeAnnotation,
            actualReturnTypes,
            actualYieldTypes,
          );
          return;
        }

        if (actualReturnTypes.length === 0) {
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

function getTypeArgumentsForTypeName(
  typeName: string,
  node: TSESTree.TypeNode,
): TSESTree.TypeNode[] | null {
  if (
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === typeName &&
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
  if (node.type === AST_NODE_TYPES.TSArrayType) {
    return node.elementType;
  }

  return null;
}

function getTypeArgumentIfTupleNode(
  node: TSESTree.TypeNode,
): TSESTree.TypeNode[] | null {
  if (
    node.type === AST_NODE_TYPES.TSTupleType &&
    node.elementTypes.length > 0
  ) {
    return node.elementTypes;
  }

  return null;
}
