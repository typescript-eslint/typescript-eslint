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
  readonlynessOptionsSchema,
  typeMatchesSpecifier,
  TypeOrValueSpecifier,
} from '../util';

type Options = [
  {
    allowStrings?: boolean;
    allowFunctions?: boolean;
    allowClassInstances?: boolean;
    allowClassDeclarations?: boolean;
    allowForKnownSafeIterables?: TypeOrValueSpecifier[];
  },
];

type MessageIds =
  | 'noStringSpreadInArray'
  | 'noPromiseSpreadInObject'
  | 'noIterableSpreadInObject'
  | 'noFunctionSpreadInObject'
  | 'noMapSpreadInObject'
  | 'noArraySpreadInObject'
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

      noPromiseSpreadInObject:
        'Using the spread operator on Promise in an object can cause unexpected behavior. Did you forget to await the promise?',

      noIterableSpreadInObject:
        'Using the spread operator on an Iterable in an object can cause unexpected behavior.',

      noFunctionSpreadInObject:
        'Using the spread operator on a function without additional properties can cause unexpected behavior. Did you forget to call the function?',

      noMapSpreadInObject:
        'Using the spread operator on a Map in an object will result in an emtpy object. Did you mean to use `Object.fromEntries(map)` instead?',

      noArraySpreadInObject:
        'Using the spread operator on an array in an object will result in a list of indices.',

      noClassInstanceSpreadInObject:
        'Using the spread operator on class instances will lose their class prototype.',

      noClassDeclarationSpreadInObject:
        'Using the spread operator on class declarations will spread only their static properties, and will lose their class prototype.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowForKnownSafeIterables: {
            ...readonlynessOptionsSchema.properties.allow,
            description:
              'An array of iterables type specifiers that are known to be safe to spread in objects.',
          },
          allowStrings: {
            description:
              'Whether to allow spreading strings in arrays. Defaults to false.',
            type: 'boolean',
          },
          allowFunctions: {
            description:
              'Whether to allow spreading functions without properties in objects. Defaults to false.',
            type: 'boolean',
          },
          allowIterables: {
            description:
              'Whether to allow spreading iterables in objects. Defaults to false.',
            type: 'boolean',
          },
          allowClassInstances: {
            description:
              'Whether to allow spreading class instances in objects. Defaults to false.',
            type: 'boolean',
          },
          allowClassDeclarations: {
            description:
              'Whether to allow spreading class declarations in objects. Defaults to false.',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  defaultOptions: [
    {
      allowStrings: false,
      allowFunctions: false,
      allowClassInstances: false,
      allowClassDeclarations: false,
      allowForKnownSafeIterables: [],
    },
  ],

  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function checkArraySpread(node: TSESTree.SpreadElement): void {
      const type = getConstrainedTypeAtLocation(services, node.argument);

      if (!options.allowStrings && isString(type)) {
        context.report({
          node,
          messageId: 'noStringSpreadInArray',
        });

        return;
      }
    }

    function checkObjectSpread(node: TSESTree.SpreadElement): void {
      const type = getConstrainedTypeAtLocation(services, node.argument);

      if (isPromise(services.program, type)) {
        context.report({
          node,
          messageId: 'noPromiseSpreadInObject',
        });

        return;
      }

      if (!options.allowFunctions && isFunctionWithoutProps(type)) {
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

      if (!options.allowClassInstances && isClassInstance(type)) {
        context.report({
          node,
          messageId: 'noClassInstanceSpreadInObject',
        });

        return;
      }

      if (
        !options.allowClassDeclarations &&
        isClassDeclaration(type) &&
        !isClassInstance(type)
      ) {
        context.report({
          node,
          messageId: 'noClassDeclarationSpreadInObject',
        });

        return;
      }

      const isTypeAllowed = () => {
        const allowedTypes = options.allowForKnownSafeIterables ?? [];

        return allowedTypes.some(specifier =>
          typeMatchesSpecifier(type, specifier, services.program),
        );
      };

      if (isIterable(type, checker) && !isString(type) && !isTypeAllowed()) {
        context.report({
          node,
          messageId: 'noIterableSpreadInObject',
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

function isClassInstance(type: ts.Type): boolean {
  return isTypeRecurser(type, t => {
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
  return isTypeRecurser(
    type,
    t =>
      isBuiltinSymbolLike(program, t, 'Map') ||
      isBuiltinSymbolLike(program, t, 'ReadonlyMap') ||
      isBuiltinSymbolLike(program, t, 'WeakMap'),
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
