import {
  isTypeAnyType,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

export default createRule({
  name: 'thenable-in-promise-aggregators',
  meta: {
    docs: {
      description:
        'Disallow passing non-Thenable values to promise aggregators',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      inArray:
        'Unexpected non-Thenable value in array passed to promise aggregator.',
      arrayArg:
        'Unexpected array of non-Thenable values passed to promise aggregator.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    const aggregateFunctionNames = ['all', 'race', 'allSettled'];

    function skipChainExpression<T extends TSESTree.Node>(
      node: T,
    ): T | TSESTree.ChainElement {
      return node.type === AST_NODE_TYPES.ChainExpression
        ? node.expression
        : node;
    }

    function isSymbolFromDefaultLibrary(
      program: ts.Program,
      symbol: ts.Symbol | undefined,
    ): boolean {
      if (!symbol) {
        return false;
      }

      const declarations = symbol.getDeclarations() ?? [];
      for (const declaration of declarations) {
        const sourceFile = declaration.getSourceFile();
        if (program.isSourceFileDefaultLibrary(sourceFile)) {
          return true;
        }
      }

      return false;
    }

    function isPromiseLike(program: ts.Program, type: ts.Type): boolean {
      return isBuiltinSymbolLike(program, type, 'Promise');
    }

    function isPromiseConstructorLike(
      program: ts.Program,
      type: ts.Type,
    ): boolean {
      return isBuiltinSymbolLike(program, type, 'PromiseConstructor');
    }

    function isBuiltinSymbolLike(
      program: ts.Program,
      type: ts.Type,
      symbolName: string,
    ): boolean {
      if (type.isIntersection()) {
        return type.types.some(t =>
          isBuiltinSymbolLike(program, t, symbolName),
        );
      }
      if (type.isUnion()) {
        return type.types.every(t =>
          isBuiltinSymbolLike(program, t, symbolName),
        );
      }

      const symbol = type.getSymbol();
      if (!symbol) {
        return false;
      }

      if (
        symbol.getName() === symbolName &&
        isSymbolFromDefaultLibrary(program, symbol)
      ) {
        return true;
      }

      if (symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
        const checker = program.getTypeChecker();

        for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
          if (isBuiltinSymbolLike(program, baseType, symbolName)) {
            return true;
          }
        }
      }

      return false;
    }

    function isPartiallyLikeType(
      type: ts.Type,
      predicate: (type: ts.Type) => boolean,
    ): boolean {
      if (isTypeAnyType(type) || isTypeUnknownType(type)) {
        return true;
      }
      if (type.isIntersection() || type.isUnion()) {
        return type.types.some(t => isPartiallyLikeType(t, predicate));
      }
      return predicate(type);
    }

    function isIndexableWithSomeElementsLike(
      type: ts.Type,
      predicate: (type: ts.Type) => boolean,
    ): boolean {
      if (isTypeAnyType(type) || isTypeUnknownType(type)) {
        return true;
      }

      if (type.isIntersection() || type.isUnion()) {
        return type.types.some(t =>
          isIndexableWithSomeElementsLike(t, predicate),
        );
      }

      if (!checker.isArrayType(type) && !checker.isTupleType(type)) {
        const indexType = checker.getIndexTypeOfType(type, ts.IndexKind.Number);
        if (indexType === undefined) {
          return false;
        }

        return isPartiallyLikeType(indexType, predicate);
      }

      const typeArgs = type.typeArguments;
      if (typeArgs === undefined) {
        throw new Error(
          'Expected to find type arguments for an array or tuple.',
        );
      }

      return typeArgs.some(t => isPartiallyLikeType(t, predicate));
    }

    return {
      CallExpression(node: TSESTree.CallExpression): void {
        const callee = skipChainExpression(node.callee);
        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        if (callee.computed) {
          if (
            callee.property.type !== AST_NODE_TYPES.Literal ||
            typeof callee.property.value !== 'string' ||
            !aggregateFunctionNames.includes(callee.property.value)
          ) {
            return;
          }
        } else if (!aggregateFunctionNames.includes(callee.property.name)) {
          return;
        }

        const callerType = services.getTypeAtLocation(callee.object);
        if (
          !isPromiseConstructorLike(services.program, callerType) &&
          !isPromiseLike(services.program, callerType)
        ) {
          return;
        }

        const args = node.arguments;
        if (args.length < 1) {
          return;
        }

        const arg = args[0];
        if (arg.type === AST_NODE_TYPES.ArrayExpression) {
          const { elements } = arg;
          if (elements.length === 0) {
            return;
          }

          for (const element of elements) {
            if (element == null) {
              context.report({
                messageId: 'inArray',
                node: arg,
              });
              return;
            }
            const elementType = services.getTypeAtLocation(element);
            if (isTypeAnyType(elementType) || isTypeUnknownType(elementType)) {
              continue;
            }

            const originalNode = services.esTreeNodeToTSNodeMap.get(element);
            if (tsutils.isThenableType(checker, originalNode, elementType)) {
              continue;
            }

            context.report({
              messageId: 'inArray',
              node: element,
            });
          }
          return;
        }

        const argType = services.getTypeAtLocation(arg);
        const originalNode = services.esTreeNodeToTSNodeMap.get(arg);
        if (
          isIndexableWithSomeElementsLike(argType, elementType => {
            return tsutils.isThenableType(checker, originalNode, elementType);
          })
        ) {
          return;
        }

        context.report({
          messageId: 'arrayArg',
          node: arg,
        });
      },
    };
  },
});
