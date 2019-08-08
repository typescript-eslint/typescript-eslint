import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
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
  },
];
type MessageIds = 'bannedTypeMessage';

function stringifyTypeName(
  node: TSESTree.EntityName,
  sourceCode: TSESLint.SourceCode,
): string {
  return sourceCode.getText(node).replace(/ /g, '');
}

function getCustomMessage(
  bannedType: null | string | { message?: string; fixWith?: string },
) {
  if (bannedType === null) {
    return '';
  }

  if (typeof bannedType === 'string') {
    return ` ${bannedType}`;
  }

  if (bannedType.message) {
    return ` ${bannedType.message}`;
  }

  return '';
}

export default util.createRule<Options, MessageIds>({
  name: 'ban-types',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Bans specific types from being used',
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
    function reportBannedType(
      node:
        | TSESTree.EntityName
        | TSESTree.TSNullKeyword
        | TSESTree.TSUndefinedKeyword,
      name: string,
    ) {
      const bannedType = bannedTypes[name];
      const customMessage = getCustomMessage(bannedType);
      const fixWith =
        bannedType && typeof bannedType === 'object' && bannedType.fixWith;

      context.report({
        node: node,
        messageId: 'bannedTypeMessage',
        data: {
          name,
          customMessage,
        },
        fix: fixWith ? fixer => fixer.replaceText(node, fixWith) : null,
      });
    }

    const ruleListener: TSESLint.RuleListener = {
      TSTypeReference({ typeName }) {
        const name = stringifyTypeName(typeName, context.getSourceCode());
        if (name in bannedTypes) {
          reportBannedType(typeName, name);
        }
      },
    };

    if ('null' in bannedTypes) {
      ruleListener.TSNullKeyword = typeName => {
        reportBannedType(typeName, 'null');
      };
    }

    if ('undefined' in bannedTypes) {
      ruleListener.TSUndefinedKeyword = typeName => {
        reportBannedType(typeName, 'undefined');
      };
    }

    return ruleListener;
  },
});
