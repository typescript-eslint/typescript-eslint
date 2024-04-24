import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
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
  | 'noClassInstanceSpreadInObject'
  | 'noClassDeclarationSpreadInObject';

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
        'Using the spread operator on `{{type}}` in an object can cause unexpected behavior.',

      noFunctionSpreadInObject:
        'Using the spread operator on a function without additional properties can cause unexpected behavior. Did you forget to call the function?',

      noClassInstanceSpreadInObject:
        'Using the spread operator on class instances without `[Symbol.iterator]` can cause unexpected behavior.',

      noClassDeclarationSpreadInObject:
        'Using the spread operator on class declarations can cause unexpected behavior. Did you forget to instantiate the class?',
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

      if (isString(type)) {
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

      if (isPromise(services.program, type)) {
        context.report({
          node,
          messageId: 'noSpreadInObject',
          data: {
            type: 'Promise',
          },
        });

        return;
      }

      if (isFunctionWithoutProps(type)) {
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

      if (!options.allowClassInstances && isClassInstance(type)) {
        context.report({
          node,
          messageId: 'noClassInstanceSpreadInObject',
        });

        return;
      }

      if (node.argument.type === AST_NODE_TYPES.ClassExpression) {
        context.report({
          node,
          messageId: 'noClassDeclarationSpreadInObject',
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
  return tsutils
    .typeParts(type)
    .some(
      t => !!tsutils.getWellKnownSymbolPropertyOfType(t, 'iterator', checker),
    );
}

function isString(type: ts.Type): boolean {
  return tsutils
    .typeParts(type)
    .some(t => !!isTypeFlagSet(t, ts.TypeFlags.StringLike));
}

function isFunctionWithoutProps(type: ts.Type): boolean {
  return tsutils
    .typeParts(type)
    .some(
      t => t.getCallSignatures().length > 0 && t.getProperties().length === 0,
    );
}

function isPromise(program: ts.Program, type: ts.Type): boolean {
  return tsutils.typeParts(type).some(t => isPromiseLike(program, t));
}

function isClassInstance(type: ts.Type): boolean {
  return tsutils.typeParts(type).some(t => t.isClassOrInterface());
}
