import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isBuiltinSymbolLike,
  isPromiseLike,
  isTypeFlagSet,
  readonlynessOptionsSchema,
  typeMatchesSpecifier,
} from '../util';

type Options = [
  {
    allow?: TypeOrValueSpecifier[];
  },
];

type MessageIds =
  | 'noArraySpreadInObject'
  | 'noClassDeclarationSpreadInObject'
  | 'noClassInstanceSpreadInObject'
  | 'noFunctionSpreadInObject'
  | 'noIterableSpreadInObject'
  | 'noMapSpreadInObject'
  | 'noPromiseSpreadInObject'
  | 'noStringSpreadInArray';

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
      noArraySpreadInObject:
        'Using the spread operator on an array in an object will result in a list of indices.',
      noClassDeclarationSpreadInObject:
        'Using the spread operator on class declarations will spread only their static properties, and will lose their class prototype.',
      noClassInstanceSpreadInObject:
        'Using the spread operator on class instances will lose their class prototype.',
      noFunctionSpreadInObject:
        'Using the spread operator on a function without additional properties can cause unexpected behavior. Did you forget to call the function?',
      noIterableSpreadInObject:
        'Using the spread operator on an Iterable in an object can cause unexpected behavior.',
      noMapSpreadInObject:
        'Using the spread operator on a Map in an object will result in an emtpy object. Did you mean to use `Object.fromEntries(map)` instead?',
      noPromiseSpreadInObject:
        'Using the spread operator on Promise in an object can cause unexpected behavior. Did you forget to await the promise?',
      noStringSpreadInArray:
        "Using the spread operator on a string can cause unexpected behavior. Prefer `String.split('')` instead.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: {
            ...readonlynessOptionsSchema.properties.allow,
            description:
              'An array of type specifiers that are known to be safe to spread.',
          },
        },
      },
    ],
  },

  defaultOptions: [
    {
      allow: [],
    },
  ],

  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function checkArraySpread(node: TSESTree.SpreadElement): void {
      const type = getConstrainedTypeAtLocation(services, node.argument);

      if (isTypeAllowed(type)) {
        return;
      }

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

      if (isTypeAllowed(type)) {
        return;
      }

      if (isPromise(services.program, type)) {
        context.report({
          node,
          messageId: 'noPromiseSpreadInObject',
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

      if (isMap(services.program, type)) {
        context.report({
          node,
          messageId: 'noMapSpreadInObject',
        });

        return;
      }

      if (isArray(checker, type)) {
        context.report({
          node,
          messageId: 'noArraySpreadInObject',
        });

        return;
      }

      if (
        isIterable(type, checker) &&
        // Don't report when the type is string, since TS will flag it already
        !isString(type)
      ) {
        context.report({
          node,
          messageId: 'noIterableSpreadInObject',
        });

        return;
      }

      if (isClassInstance(services.program, type)) {
        context.report({
          node,
          messageId: 'noClassInstanceSpreadInObject',
        });

        return;
      }

      if (isClassDeclaration(type)) {
        context.report({
          node,
          messageId: 'noClassDeclarationSpreadInObject',
        });

        return;
      }
    }

    function isTypeAllowed(type: ts.Type): boolean {
      if (!options.allow) {
        return false;
      }

      return options.allow.some(specifier =>
        typeMatchesSpecifier(type, specifier, services.program),
      );
    }

    return {
      'ArrayExpression > SpreadElement': checkArraySpread,
      'ObjectExpression > SpreadElement': checkObjectSpread,
    };
  },
});

function isIterable(type: ts.Type, checker: ts.TypeChecker): boolean {
  return tsutils
    .typeParts(type)
    .some(
      t => !!tsutils.getWellKnownSymbolPropertyOfType(t, 'iterator', checker),
    );
}

function isArray(checker: ts.TypeChecker, type: ts.Type): boolean {
  return isTypeRecurser(
    type,
    t => checker.isArrayType(t) || checker.isTupleType(t),
  );
}

function isString(type: ts.Type): boolean {
  return isTypeRecurser(type, t => isTypeFlagSet(t, ts.TypeFlags.StringLike));
}

function isFunctionWithoutProps(type: ts.Type): boolean {
  return isTypeRecurser(
    type,
    t => t.getCallSignatures().length > 0 && t.getProperties().length === 0,
  );
}

function isPromise(program: ts.Program, type: ts.Type): boolean {
  return isTypeRecurser(type, t => isPromiseLike(program, t));
}

// Builtin classes that are known to be problematic when spread,
// but can't be detected in a reliable way.
const BUILTIN_CLASSES = ['WeakRef'];

function isClassInstance(program: ts.Program, type: ts.Type): boolean {
  return isTypeRecurser(type, t => {
    const symbol = t.getSymbol();

    if (!symbol) {
      return false;
    }

    const isBuiltinProblematic = BUILTIN_CLASSES.some(name =>
      isBuiltinSymbolLike(program, t, name),
    );

    if (isBuiltinProblematic) {
      return true;
    }

    return (
      t.isClassOrInterface() &&
      tsutils.isSymbolFlagSet(t.symbol, ts.SymbolFlags.Value)
    );
  });
}

function isClassDeclaration(type: ts.Type): boolean {
  return isTypeRecurser(type, t => {
    if (
      tsutils.isObjectType(t) &&
      tsutils.isObjectFlagSet(t, ts.ObjectFlags.InstantiationExpressionType)
    ) {
      return true;
    }

    const kind = t.getSymbol()?.valueDeclaration?.kind;

    return (
      kind === ts.SyntaxKind.ClassDeclaration ||
      kind === ts.SyntaxKind.ClassExpression
    );
  });
}

function isMap(program: ts.Program, type: ts.Type): boolean {
  return isTypeRecurser(type, t =>
    isBuiltinSymbolLike(program, t, ['Map', 'ReadonlyMap', 'WeakMap']),
  );
}

function isTypeRecurser(
  type: ts.Type,
  predicate: (t: ts.Type) => boolean,
): boolean {
  if (type.isUnionOrIntersection()) {
    return type.types.some(t => isTypeRecurser(t, predicate));
  }

  return predicate(type);
}
