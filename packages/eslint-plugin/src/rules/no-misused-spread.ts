import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isBuiltinSymbolLike,
  isPromiseLike,
  isTypeFlagSet,
} from '../util';

type Options = [
  {
    allowClassInstances: boolean;
  },
];

type MessageIds =
  | 'noStringSpreadInArray'
  | 'noSpreadInObject'
  | 'noFunctionSpreadInObject'
  | 'noClassSpreadInObject';

export default createRule<Options, MessageIds>({
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
        "Using the spread operator on a string can cause unexpected behavior. Prefer `String.split('')` instead.",

      noSpreadInObject:
        'Using the spread operator on `{{type}}` can cause unexpected behavior.',

      noFunctionSpreadInObject:
        'Using the spread operator on `Function` without additional properties can cause unexpected behavior. Did you forget to call the function?',

      noClassSpreadInObject:
        'Using the spread operator on class instances can cause unexpected behavior.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowClassInstances: {
            description:
              'Whether to allow spreading class instances in objects.',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  defaultOptions: [
    {
      allowClassInstances: false,
    },
  ],

  create(context, [options]) {
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

      if (isPromise(services.program, type, checker)) {
        context.report({
          node,
          messageId: 'noSpreadInObject',
          data: {
            type: 'Promise',
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

      if (!options.allowClassInstances && isClassInstance(type, checker)) {
        context.report({
          node,
          messageId: 'noClassSpreadInObject',
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

function isPromise(
  program: ts.Program,
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(t => isPromise(program, t, checker));
  }

  return isPromiseLike(program, type);
}

function isClassInstance(type: ts.Type, checker: ts.TypeChecker): boolean {
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(t => isClassInstance(t, checker));
  }

  return type.isClassOrInterface();
}
