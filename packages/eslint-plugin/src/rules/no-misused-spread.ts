import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getWrappingFixer,
  isBuiltinSymbolLike,
  isPromiseLike,
  isTypeFlagSet,
  readonlynessOptionsSchema,
  typeMatchesSomeSpecifier,
  isHigherPrecedenceThanAwait,
} from '../util';

type Options = [
  {
    allow?: TypeOrValueSpecifier[];
  },
];

type MessageIds =
  | 'addAwait'
  | 'noArraySpreadInObject'
  | 'noClassDeclarationSpreadInObject'
  | 'noClassInstanceSpreadInObject'
  | 'noFunctionSpreadInObject'
  | 'noIterableSpreadInObject'
  | 'noMapSpreadInObject'
  | 'noPromiseSpreadInObject'
  | 'noStringSpread'
  | 'replaceMapSpreadInObject';

export default createRule<Options, MessageIds>({
  name: 'no-misused-spread',
  meta: {
    type: 'problem',
    docs: {
      recommended: 'strict',
      description:
        'Disallow using the spread operator when it might cause unexpected behavior',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      addAwait: 'Add await operator.',
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
        'Consider using `Intl.Segmenter` for locale-aware string decomposition.',
        "Otherwise, if you don't need to preserve emojis or other non-Ascii characters, disable this lint rule on this line or configure the 'allow' rule option.",
      ].join('\n'),
      replaceMapSpreadInObject:
        'Replace map spread in object with `Object.fromEntries()`',
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

    function getMapSpreadSuggestions(
      node: TSESTree.JSXSpreadAttribute | TSESTree.SpreadElement,
      type: ts.Type,
    ): TSESLint.ReportSuggestionArray<MessageIds> | null {
      const types = tsutils.unionConstituents(type);
      if (types.some(t => !isMap(services.program, t))) {
        return null;
      }

      if (
        node.parent.type === AST_NODE_TYPES.ObjectExpression &&
        node.parent.properties.length === 1
      ) {
        return [
          {
            messageId: 'replaceMapSpreadInObject',
            fix: getWrappingFixer({
              node: node.parent,
              innerNode: node.argument,
              sourceCode: context.sourceCode,
              wrap: code => `Object.fromEntries(${code})`,
            }),
          },
        ];
      }

      return [
        {
          messageId: 'replaceMapSpreadInObject',
          fix: getWrappingFixer({
            node: node.argument,
            sourceCode: context.sourceCode,
            wrap: code => `Object.fromEntries(${code})`,
          }),
        },
      ];
    }

    function getPromiseSpreadSuggestions(
      node: TSESTree.Expression,
    ): TSESLint.ReportSuggestionArray<MessageIds> {
      const isHighPrecendence = isHigherPrecedenceThanAwait(
        services.esTreeNodeToTSNodeMap.get(node),
      );

      return [
        {
          messageId: 'addAwait',
          fix: fixer =>
            isHighPrecendence
              ? fixer.insertTextBefore(node, 'await ')
              : [
                  fixer.insertTextBefore(node, 'await ('),
                  fixer.insertTextAfter(node, ')'),
                ],
        },
      ];
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
          suggest: getPromiseSpreadSuggestions(node.argument),
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
          suggest: getMapSpreadSuggestions(node, type),
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
    .typeConstituents(type)
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
