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
  typeMatchesSomeSpecifier,
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
  | 'noStringSpread';

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
        'Using the spread operator on a Map in an object will result in an empty object. Did you mean to use `Object.fromEntries(map)` instead?',
      noPromiseSpreadInObject:
        'Using the spread operator on Promise in an object can cause unexpected behavior. Did you forget to await the promise?',
      noStringSpread: [
        'Using the spread operator on a string can mishandle special characters, as can `.split("")`.',
        '- `...` produces Unicode code points, which will decompose complex emojis into individual emojis',
        '- .split("") produces UTF-16 code units, which breaks rich characters in many languages',
        "If this string does not need to preserve emojis or other non-English characters, disable this lint rule on this line or configure the 'allow' rule option.",
        'Otherwise, consider using `Intl.Segmenter`.',
      ].join('\n'),
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

    function checkArrayOrCallSpread(node: TSESTree.SpreadElement): void {
      const type = getConstrainedTypeAtLocation(services, node.argument);

      if (
        !typeMatchesSomeSpecifier(type, options.allow, services.program) &&
        isString(type)
      ) {
        context.report({
          node,
          messageId: 'noStringSpread',
        });
      }
    }

    function checkObjectSpread(
      node: TSESTree.JSXSpreadAttribute | TSESTree.SpreadElement,
    ): void {
      const type = getConstrainedTypeAtLocation(services, node.argument);

      if (typeMatchesSomeSpecifier(type, options.allow, services.program)) {
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

      if (isClassInstance(checker, type)) {
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
      }
    }

    return {
      'ArrayExpression > SpreadElement': checkArrayOrCallSpread,
      'CallExpression > SpreadElement': checkArrayOrCallSpread,
      JSXSpreadAttribute: checkObjectSpread,
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

function isClassInstance(checker: ts.TypeChecker, type: ts.Type): boolean {
  return isTypeRecurser(type, t => {
    // If the type itself has a construct signature, it's a class(-like)
    if (t.getConstructSignatures().length) {
      return false;
    }

    const symbol = t.getSymbol();

    // If the type's symbol has a construct signature, the type is an instance
    return !!symbol
      ?.getDeclarations()
      ?.some(
        declaration =>
          checker
            .getTypeOfSymbolAtLocation(symbol, declaration)
            .getConstructSignatures().length,
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
