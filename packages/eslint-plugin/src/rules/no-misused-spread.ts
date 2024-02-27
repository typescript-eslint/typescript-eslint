import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isBuiltinSymbolLike,
  isTypeFlagSet,
} from '../util';

type MessageIds =
  | 'noStringSpreadInArray'
  | 'noSpreadInObject'
  | 'noFunctionSpreadInObject';

export default createRule<[], MessageIds>({
  name: 'no-misused-spread',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow using the spread operator when it might cause unexpected behavior',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      noStringSpreadInArray:
        "Using the spread operator on a string is not allowed in an array. Use `String.split('')` instead.",

      noSpreadInObject:
        'Using the spread operator on `{{type}}` is not allowed in an object.',

      noFunctionSpreadInObject:
        'Using the spread operator on `Function` without properties is not allowed in an object. Did you forget to call the function?',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function checkArraySpread(node: TSESTree.SpreadElement): void {
      const type = getConstrainedTypeAtLocation(services, node.argument);

      if (isString(type, checker)) {
        context.report({
          node,
          messageId: 'noStringSpreadInArray',
        });

        return;
      }
    }

    function checkObjectSpread(node: TSESTree.SpreadElement): void {
      const type = getConstrainedTypeAtLocation(services, node.argument);

      if (isArray(type, checker)) {
        context.report({
          node,
          messageId: 'noSpreadInObject',
          data: {
            type: 'Array',
          },
        });

        return;
      }

      if (
        isBuiltinSymbol(services.program, type, 'Set') ||
        isBuiltinSymbol(services.program, type, 'ReadonlySet')
      ) {
        context.report({
          node,
          messageId: 'noSpreadInObject',
          data: {
            type: 'Set',
          },
        });

        return;
      }

      if (
        isBuiltinSymbol(services.program, type, 'Map') ||
        isBuiltinSymbol(services.program, type, 'ReadonlyMap')
      ) {
        context.report({
          node,
          messageId: 'noSpreadInObject',
          data: {
            type: 'Map',
          },
        });

        return;
      }

      if (isFunctionWithoutProps(type, checker)) {
        context.report({
          node,
          messageId: 'noFunctionSpreadInObject',
        });

        return;
      }

      if (isIterable(type, checker)) {
        context.report({
          node,
          messageId: 'noSpreadInObject',
          data: {
            type: 'Iterable',
          },
        });

        return;
      }
    }

    return {
      'ArrayExpression > SpreadElement': checkArraySpread,
      'ObjectExpression > SpreadElement': checkObjectSpread,
    };
  },
});

function isArray(type: ts.Type, checker: ts.TypeChecker): boolean {
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(t => isArray(t, checker));
  }

  return checker.isArrayType(type) || checker.isTupleType(type);
}

function isIterable(type: ts.Type, checker: ts.TypeChecker): boolean {
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(t => isIterable(t, checker));
  }

  const iterator = tsutils.getWellKnownSymbolPropertyOfType(
    type,
    'iterator',
    checker,
  );

  return iterator !== undefined;
}

function isString(type: ts.Type, checker: ts.TypeChecker): boolean {
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(t => isString(t, checker));
  }

  return isTypeFlagSet(type, ts.TypeFlags.StringLike);
}

function isBuiltinSymbol(
  program: ts.Program,
  type: ts.Type,
  symbolName: string,
): boolean {
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(t => isBuiltinSymbol(program, t, symbolName));
  }

  return isBuiltinSymbolLike(program, type, symbolName);
}

function isFunctionWithoutProps(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(t => isFunctionWithoutProps(t, checker));
  }

  return (
    type.getCallSignatures().length > 0 && type.getProperties().length === 0
  );
}
