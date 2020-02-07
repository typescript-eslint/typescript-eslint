import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Types = Record<
  string,
  | string
  | null
  | {
      message: string;
      fixWith?: string;
    }
>;

type Options = [
  {
    types: Types;
  },
];
type MessageIds = 'bannedTypeMessage';

function removeSpaces(str: string): string {
  return str.replace(/ /g, '');
}

function stringifyTypeName(
  node:
    | TSESTree.EntityName
    | TSESTree.TSTypeLiteral
    | TSESTree.TSNullKeyword
    | TSESTree.TSUndefinedKeyword,
  sourceCode: TSESLint.SourceCode,
): string {
  return removeSpaces(sourceCode.getText(node));
}

function getCustomMessage(
  bannedType: null | string | { message?: string; fixWith?: string },
): string {
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
  create(context, [{ types }]) {
    const bannedTypes = new Map(
      Object.entries(types).map(([type, data]) => [removeSpaces(type), data]),
    );

    function checkBannedTypes(
      typeNode:
        | TSESTree.EntityName
        | TSESTree.TSTypeLiteral
        | TSESTree.TSNullKeyword
        | TSESTree.TSUndefinedKeyword,
      name = stringifyTypeName(typeNode, context.getSourceCode()),
    ): void {
      const bannedType = bannedTypes.get(name);

      if (bannedType !== undefined) {
        const customMessage = getCustomMessage(bannedType);
        const fixWith =
          bannedType && typeof bannedType === 'object' && bannedType.fixWith;

        context.report({
          node: typeNode,
          messageId: 'bannedTypeMessage',
          data: {
            name,
            customMessage,
          },
          fix: fixWith ? fixer => fixer.replaceText(typeNode, fixWith) : null,
        });
      }
    }

    return {
      ...(bannedTypes.has('null') && {
        TSNullKeyword(node) {
          checkBannedTypes(node, 'null');
        },
      }),

      ...(bannedTypes.has('undefined') && {
        TSUndefinedKeyword(node) {
          checkBannedTypes(node, 'undefined');
        },
      }),

      TSTypeLiteral(node): void {
        if (node.members.length) {
          return;
        }

        checkBannedTypes(node);
      },
      TSTypeReference({ typeName }): void {
        checkBannedTypes(typeName);
      },
    };
  },
});
