import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

import {
  getConstrainedTypeAtLocation,
  isBuiltinSymbolLike,
} from '@typescript-eslint/type-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getParserServices,
  getStaticMemberAccessValue,
} from '../util';

type Options = [];

type MessageIds =
  | 'noMapOrSetInObjectAssign'
  | 'noMapOrSetInObjectEntries'
  | 'noMapOrSetInObjectHasOwn'
  | 'noMapOrSetInObjectHasOwnProperty'
  | 'noMapOrSetInObjectKeys'
  | 'noMapOrSetInObjectValues';

const objectConstructorMethodsMap = new Map<string, MessageIds>([
  ['assign', 'noMapOrSetInObjectAssign'],
  ['entries', 'noMapOrSetInObjectEntries'],
  ['hasOwn', 'noMapOrSetInObjectHasOwn'],
  ['hasOwnProperty', 'noMapOrSetInObjectHasOwnProperty'],
  ['keys', 'noMapOrSetInObjectKeys'],
  ['values', 'noMapOrSetInObjectValues'],
]);

export default createRule<Options, MessageIds>({
  name: 'no-misused-object-likes',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow using `Object` methods on `Map` or `Set` when it might cause unexpected behavior',
      requiresTypeChecking: true,
    },
    messages: {
      noMapOrSetInObjectAssign:
        "Using 'Object.assign()' with a '{{type}}' may lead to unexpected results. Consider alternative approaches instead.",
      noMapOrSetInObjectEntries:
        "Using 'Object.entries()' on a '{{type}}' will return an empty array. Consider using the 'entries()' method instead.",
      noMapOrSetInObjectHasOwn:
        "Using 'Object.hasOwn()' on a '{{type}}' may lead to unexpected results. Consider using the 'has(key)' method instead.",
      noMapOrSetInObjectHasOwnProperty:
        "Using 'Object.hasOwnProperty()' on a '{{type}}' may lead to unexpected results. Consider using the 'has(key)' method instead.",
      noMapOrSetInObjectKeys:
        "Using 'Object.keys()' on a '{{type}}' will return an empty array. Consider using the 'keys()' method instead.",
      noMapOrSetInObjectValues:
        "Using 'Object.values()' on a '{{type}}' will return an empty array. Consider using the 'values()' method instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);

    return {
      CallExpression(node): void {
        const objectMethodName = getPotentiallyMisusedObjectConstructorMethod(
          context,
          services,
          node,
        );

        if (objectMethodName == null) {
          return;
        }

        const objectArgument = node.arguments.at(0);

        if (!objectArgument) {
          return;
        }

        const typeName = getViolatingTypeName(
          services,
          getConstrainedTypeAtLocation(services, objectArgument),
        );

        if (typeName) {
          const messageId = objectConstructorMethodsMap.get(objectMethodName);

          if (messageId) {
            context.report({
              node,
              messageId,
              data: {
                type: typeName,
              },
            });
          }
        }
      },
    };
  },
});

function getViolatingTypeName(
  services: ParserServicesWithTypeInformation,
  type: ts.Type,
): string | null {
  if (isSet(services.program, type)) {
    return 'Set';
  }

  if (isMap(services.program, type)) {
    return 'Map';
  }

  return null;
}

function isMap(program: ts.Program, type: ts.Type): boolean {
  return isTypeRecurser(type, t =>
    isBuiltinSymbolLike(program, t, ['Map', 'ReadonlyMap', 'WeakMap']),
  );
}

function isSet(program: ts.Program, type: ts.Type): boolean {
  return isTypeRecurser(type, t =>
    isBuiltinSymbolLike(program, t, ['Set', 'ReadonlySet', 'WeakSet']),
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

function getPotentiallyMisusedObjectConstructorMethod(
  context: RuleContext<string, unknown[]>,
  services: ParserServicesWithTypeInformation,
  node: TSESTree.CallExpression,
): string | null {
  if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
    return null;
  }

  const objectType = getConstrainedTypeAtLocation(services, node.callee.object);

  if (!isBuiltinSymbolLike(services.program, objectType, 'ObjectConstructor')) {
    return null;
  }

  const staticAccessValue = getStaticMemberAccessValue(node.callee, context);

  if (typeof staticAccessValue !== 'string') {
    return null;
  }

  if (!objectConstructorMethodsMap.has(staticAccessValue)) {
    return null;
  }

  return staticAccessValue;
}
