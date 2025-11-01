import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

const COLLECTION_TYPES = ['Map', 'Set', 'WeakMap', 'WeakSet'] as const;

const ALTERNATIVES = {
  'Object.assign': {
    Map: 'map.set(key, value) or new Map([...map, ...otherMap])',
    Set: 'set.add(value) or new Set([...set, ...otherSet])',
    WeakMap: 'map.set(key, value)',
    WeakSet: 'set.add(value)',
  },
  'Object.entries': {
    Map: 'Array.from(map.entries())',
    Set: 'Array.from(set.entries())',
    WeakMap: 'Array.from(map.entries())',
    WeakSet: 'Array.from(set.entries())',
  },
  'Object.keys': {
    Map: 'Array.from(map.keys())',
    Set: 'Array.from(set.values())',
    WeakMap: 'Array.from(map.keys())',
    WeakSet: 'Array.from(set.values())',
  },
  'Object.values': {
    Map: 'Array.from(map.values())',
    Set: 'Array.from(set.values())',
    WeakMap: 'Array.from(map.values())',
    WeakSet: 'Array.from(set.values())',
  },
};

export default createRule({
  name: 'no-object-methods-on-collections',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using Object methods on Map and Set instances',
      requiresTypeChecking: true,
    },
    messages: {
      noObjectMethodsOnCollections:
        'Using {{method}}() on a {{type}} is incorrect. Use {{alternative}} instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression(node) {
        // Is it Object.keys/values/entries/assign() call?
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.object.type !== AST_NODE_TYPES.Identifier ||
          node.callee.object.name !== 'Object' ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier ||
          !['keys', 'values', 'entries', 'assign'].includes(
            node.callee.property.name,
          )
        ) {
          return;
        }

        const methodName = node.callee.property.name;

        // For keys/values/entries, we need exactly 1 argument
        // For assign, we need at least 1 argument (the target)
        if (methodName === 'assign') {
          if (node.arguments.length < 1) {
            return;
          }
        } else {
          if (node.arguments.length !== 1) {
            return;
          }
        }

        // Get argument type as a string
        const argument = node.arguments[0];
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(argument);
        const type = checker.getTypeAtLocation(tsNode);
        const typeString = checker.typeToString(type);

        // Skip unknown types
        if (typeString === 'any' || typeString === 'unknown') {
          return;
        }

        // Is the argument a collection type?
        const collectionType = COLLECTION_TYPES.find(t =>
          typeString.includes(t),
        );
        if (!collectionType) {
          return;
        }

        const fullMethodName =
          `Object.${methodName}` as keyof typeof ALTERNATIVES;
        const alternative =
          ALTERNATIVES[fullMethodName][collectionType] ||
          `the ${collectionType}'s own methods`;

        context.report({
          node,
          messageId: 'noObjectMethodsOnCollections',
          data: {
            type: collectionType,
            alternative,
            method: fullMethodName,
          },
        });
      },
    };
  },
});
