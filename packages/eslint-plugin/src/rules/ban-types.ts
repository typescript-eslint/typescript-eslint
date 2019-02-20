/**
 * @fileoverview Enforces that types will not to be used
 * @author Armano <https://github.com/armano2>
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { ReportFixFunction } from 'ts-eslint';
import * as util from '../util';

type Options = [
  {
    types: Record<
      string,
      | string
      | null
      | {
          message: string;
          fixWith?: string;
        }
    >;
  }
];
type MessageIds = 'bannedTypeMessage';

export default util.createRule<Options, MessageIds>({
  name: 'ban-types',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces that types will not to be used',
      tslintRuleName: 'ban-types',
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      bannedTypeMessage: "Don't use '{{name}}' as a type.{{customMessage}}",
    },
    schema: [
      {
        type: 'object',
        properties: {
          types: {
            type: 'object',
            additionalProperties: {
              oneOf: [
                { type: 'null' },
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    fixWith: { type: 'string' },
                  },
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      types: {
        String: {
          message: 'Use string instead',
          fixWith: 'string',
        },
        Boolean: {
          message: 'Use boolean instead',
          fixWith: 'boolean',
        },
        Number: {
          message: 'Use number instead',
          fixWith: 'number',
        },
        Object: {
          message: 'Use Record<string, any> instead',
          fixWith: 'Record<string, any>',
        },
        Symbol: {
          message: 'Use symbol instead',
          fixWith: 'symbol',
        },
      },
    },
  ],
  create(context, [{ types: bannedTypes }]) {
    return {
      'TSTypeReference Identifier'(node: TSESTree.Identifier) {
        if (
          node.parent &&
          node.parent.type !== AST_NODE_TYPES.TSQualifiedName
        ) {
          if (node.name in bannedTypes) {
            let customMessage = '';
            const bannedCfgValue = bannedTypes[node.name];

            let fix: ReportFixFunction | null = null;

            if (typeof bannedCfgValue === 'string') {
              customMessage += ` ${bannedCfgValue}`;
            } else if (bannedCfgValue !== null) {
              if (bannedCfgValue.message) {
                customMessage += ` ${bannedCfgValue.message}`;
              }
              if (bannedCfgValue.fixWith) {
                const fixWith = bannedCfgValue.fixWith;
                fix = fixer => fixer.replaceText(node, fixWith);
              }
            }

            context.report({
              node,
              messageId: 'bannedTypeMessage',
              data: {
                name: node.name,
                customMessage,
              },
              fix,
            });
          }
        }
      },
    };
  },
});
