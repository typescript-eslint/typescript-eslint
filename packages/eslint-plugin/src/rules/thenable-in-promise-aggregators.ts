import {
  isTypeAnyType,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import ts from 'typescript';
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
      nonArrayArg: 'Unexpected non-array passed to promise aggregator.',
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

    // Is like Promise, or a class/interface extending from Promise
    function isPromiseClassLike(program: ts.Program, type: ts.Type): boolean {
      if (type.isIntersection()) {
        return type.types.some(t => isPromiseLike(program, t));
      }
      if (type.isUnion()) {
        return type.types.every(t => isPromiseLike(program, t));
      }

      const symbol = type.getSymbol();
      if (!symbol) {
        return false;
      }

      if (
        symbol.getName() === 'Promise' &&
        isSymbolFromDefaultLibrary(program, symbol)
      ) {
        return true;
      }

      if (symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
        const checker = program.getTypeChecker();

        for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
          if (isPromiseLike(program, baseType)) {
            return true;
          }
        }
      }

      return false;
    }

    // Is like PromiseConstructor, or a class/interface extending from Promise
    function isPromiseLike(program: ts.Program, type: ts.Type): boolean {
      if (type.isIntersection()) {
        return type.types.some(t => isPromiseLike(program, t));
      }
      if (type.isUnion()) {
        return type.types.every(t => isPromiseLike(program, t));
      }

      const symbol = type.getSymbol();
      if (!symbol) {
        return false;
      }

      if (
        symbol.getName() === 'PromiseConstructor' &&
        isSymbolFromDefaultLibrary(program, symbol)
      ) {
        return true;
      }

      if (symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
        const checker = program.getTypeChecker();

        for (const baseType of checker.getBaseTypes(type as ts.InterfaceType)) {
          if (isPromiseClassLike(program, baseType)) {
            return true;
          }
        }
      }

      return false;
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
        if (!isPromiseLike(services.program, callerType)) {
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
              continue;
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
        } else {
          const argType = services.getTypeAtLocation(arg);
          if (isTypeAnyType(argType) || isTypeUnknownType(argType)) {
            return;
          }

          if (!checker.isArrayType(argType)) {
            context.report({
              messageId: 'nonArrayArg',
              node: arg,
            });
            return;
          }

          if (argType.typeArguments === undefined) {
            return;
          }

          if (argType.typeArguments.length < 1) {
            return;
          }

          const typeArg = argType.typeArguments[0];
          if (isTypeAnyType(typeArg) || isTypeUnknownType(typeArg)) {
            return;
          }

          const originalNode = services.esTreeNodeToTSNodeMap.get(arg);
          if (tsutils.isThenableType(checker, originalNode, typeArg)) {
            return;
          }

          context.report({
            messageId: 'arrayArg',
            node: arg,
          });
        }
      },
    };
  },
});
