/**
 * @fileoverview Enforces that types will not to be used
 * @author Armano <https://github.com/armano2>
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule, { ReportFixFunction } from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

interface Options {
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

const defaultOptions: [Options] = [
  {
    types: {
      String: {
        message: 'Use string instead',
        fixWith: 'string'
      },
      Boolean: {
        message: 'Use boolean instead',
        fixWith: 'boolean'
      },
      Number: {
        message: 'Use number instead',
        fixWith: 'number'
      },
      Object: {
        message: 'Use Record<string, any> instead',
        fixWith: 'Record<string, any>'
      },
      Symbol: {
        message: 'Use symbol instead',
        fixWith: 'symbol'
      }
    }
  }
];

const rule: RuleModule<[Options]> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces that types will not to be used',
      extraDescription: [util.tslintRule('ban-types')],
      category: 'Best Practices',
      url: util.metaDocsUrl('ban-types'),
      recommended: 'error'
    },
    fixable: 'code',
    messages: {
      bannedTypeMessage: "Don't use '{{name}}' as a type.{{customMessage}}"
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
                    fixWith: { type: 'string' }
                  },
                  additionalProperties: false
                }
              ]
            }
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const banedTypes = util.applyDefault(defaultOptions, context.options)[0]
      .types;

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      'TSTypeReference Identifier'(node: TSESTree.Identifier) {
        if (node.parent && node.parent.type !== 'TSQualifiedName') {
          if (node.name in banedTypes) {
            let customMessage = '';
            const bannedCfgValue = banedTypes[node.name];

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
                customMessage
              },
              fix
            });
          }
        }
      }
    };
  }
};
export = rule;
