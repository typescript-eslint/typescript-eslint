import type { Identifier, MemberExpression } from '@typescript-eslint/ast-spec';
import type { TSESTree } from '@typescript-eslint/utils';

import { createRule, getParserServices } from '../util';

export type Options = [
  {
    checkObjectKeysForMap?: boolean;
    checkObjectValuesForMap?: boolean;
    checkObjectEntriesForMap?: boolean;
    checkObjectKeysForSet?: boolean;
    checkObjectValuesForSet?: boolean;
    checkObjectEntriesForSet?: boolean;
  },
];
export type MessageIds =
  | 'objectKeysForMap'
  | 'objectValuesForMap'
  | 'objectEntriesForMap'
  | 'objectKeysForSet'
  | 'objectValuesForSet'
  | 'objectEntriesForSet';

export default createRule<Options, MessageIds>({
  name: 'no-misused-object-likes',
  defaultOptions: [
    {
      checkObjectKeysForMap: true,
      checkObjectValuesForMap: true,
      checkObjectEntriesForMap: true,
      checkObjectKeysForSet: true,
      checkObjectValuesForSet: true,
      checkObjectEntriesForSet: true,
    },
  ],

  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce check `Object.values(...)`, `Object.keys(...)`, `Object.entries(...)` usage with Map/Set objects',
      requiresTypeChecking: false,
    },
    messages: {
      objectKeysForMap: "Don't use `Object.keys()` for Map objects",
      objectValuesForMap: "Don't use `Object.values()` for Map objects",
      objectEntriesForMap: "Don't use `Object.entries()` for Map objects",
      objectKeysForSet: "Don't use `Object.keys()` for Set",
      objectValuesForSet: "Don't use `Object.values()` for Set",
      objectEntriesForSet: "Don't use `Object.entries()` for Set",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkObjectKeysForMap: {
            description: 'Check usage Object.keys for Map object',
            type: 'boolean',
          },
          checkObjectValuesForMap: {
            description: 'Check usage Object.values for Map object',
            type: 'boolean',
          },
          checkObjectEntriesForMap: {
            description: 'Check usage Object.entries for Map object',
            type: 'boolean',
          },
          checkObjectKeysForSet: {
            description: 'Check usage Object.keys for Set object',
            type: 'boolean',
          },
          checkObjectValuesForSet: {
            description: 'Check usage Object.values for Set object',
            type: 'boolean',
          },
          checkObjectEntriesForSet: {
            description: 'Check usage Object.entries for Set object',
            type: 'boolean',
          },
        },
      },
    ],
  },

  create(context, [options]) {
    const services = getParserServices(context);

    function checkObjectMethodCall(
      callExpression: TSESTree.CallExpression,
    ): void {
      const argument = callExpression.arguments[0];
      const type = services.getTypeAtLocation(argument);
      const argumentTypeName = type.getSymbol()?.name;
      const callee = callExpression.callee as MemberExpression;
      const objectMethod = (callee.property as Identifier).name;

      if (argumentTypeName === 'Map') {
        if (objectMethod === 'keys' && options.checkObjectKeysForMap) {
          context.report({
            node: callExpression,
            messageId: 'objectKeysForMap',
          });
        }
        if (objectMethod === 'values' && options.checkObjectValuesForMap) {
          context.report({
            node: callExpression,
            messageId: 'objectValuesForMap',
          });
        }
        if (objectMethod === 'entries' && options.checkObjectEntriesForMap) {
          context.report({
            node: callExpression,
            messageId: 'objectEntriesForMap',
          });
        }
      }
      if (argumentTypeName === 'Set') {
        if (objectMethod === 'keys' && options.checkObjectKeysForSet) {
          context.report({
            node: callExpression,
            messageId: 'objectKeysForSet',
          });
        }
        if (objectMethod === 'values' && options.checkObjectValuesForSet) {
          context.report({
            node: callExpression,
            messageId: 'objectValuesForSet',
          });
        }
        if (objectMethod === 'entries' && options.checkObjectEntriesForSet) {
          context.report({
            node: callExpression,
            messageId: 'objectEntriesForSet',
          });
        }
      }
    }

    return {
      'CallExpression[callee.object.name=Object][callee.property.name=keys][arguments.length=1]':
        checkObjectMethodCall,
      'CallExpression[callee.object.name=Object][callee.property.name=values][arguments.length=1]':
        checkObjectMethodCall,
      'CallExpression[callee.object.name=Object][callee.property.name=entries][arguments.length=1]':
        checkObjectMethodCall,
    };
  },
});
