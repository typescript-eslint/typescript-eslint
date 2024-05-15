import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, objectReduceKey } from '../util';

type Types = Record<
  string,
  | boolean
  | string
  | {
      message: string;
      fixWith?: string;
      suggest?: readonly string[];
    }
  | null
>;

export type Options = [
  {
    types?: Types;
    extendDefaults?: boolean;
  },
];

export type MessageIds = 'bannedTypeMessage' | 'bannedTypeReplacement';

function removeSpaces(str: string): string {
  return str.replace(/\s/g, '');
}

function stringifyNode(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): string {
  return removeSpaces(sourceCode.getText(node));
}

function getCustomMessage(
  bannedType: string | true | { message?: string; fixWith?: string } | null,
): string {
  if (!bannedType || bannedType === true) {
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

const TYPE_KEYWORDS = {
  bigint: AST_NODE_TYPES.TSBigIntKeyword,
  boolean: AST_NODE_TYPES.TSBooleanKeyword,
  never: AST_NODE_TYPES.TSNeverKeyword,
  null: AST_NODE_TYPES.TSNullKeyword,
  number: AST_NODE_TYPES.TSNumberKeyword,
  object: AST_NODE_TYPES.TSObjectKeyword,
  string: AST_NODE_TYPES.TSStringKeyword,
  symbol: AST_NODE_TYPES.TSSymbolKeyword,
  undefined: AST_NODE_TYPES.TSUndefinedKeyword,
  unknown: AST_NODE_TYPES.TSUnknownKeyword,
  void: AST_NODE_TYPES.TSVoidKeyword,
};

export default createRule<Options, MessageIds>({
  name: 'no-restricted-types',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow certain types',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      bannedTypeMessage: "Don't use `{{name}}` as a type.{{customMessage}}",
      bannedTypeReplacement: 'Replace `{{name}}` with `{{replacement}}`.',
    },
    schema: [
      {
        $defs: {
          banConfig: {
            oneOf: [
              {
                type: 'boolean',
                enum: [true],
                description: 'Bans the type with the default message',
              },
              {
                type: 'string',
                description: 'Bans the type with a custom message',
              },
              {
                type: 'object',
                description: 'Bans a type',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Custom error message',
                  },
                  fixWith: {
                    type: 'string',
                    description:
                      'Type to autofix replace with. Note that autofixers can be applied automatically - so you need to be careful with this option.',
                  },
                  suggest: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Types to suggest replacing with.',
                  },
                },
                additionalProperties: false,
              },
            ],
          },
        },
        type: 'object',
        properties: {
          types: {
            type: 'object',
            additionalProperties: {
              $ref: '#/items/0/$defs/banConfig',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [{ types = {} }]) {
    const bannedTypes = new Map(
      Object.entries(types).map(([type, data]) => [removeSpaces(type), data]),
    );

    function checkBannedTypes(
      typeNode: TSESTree.Node,
      name = stringifyNode(typeNode, context.sourceCode),
    ): void {
      const bannedType = bannedTypes.get(name);

      if (bannedType === undefined || bannedType === false) {
        return;
      }

      const customMessage = getCustomMessage(bannedType);
      const fixWith =
        bannedType && typeof bannedType === 'object' && bannedType.fixWith;
      const suggest =
        bannedType && typeof bannedType === 'object'
          ? bannedType.suggest
          : undefined;

      context.report({
        node: typeNode,
        messageId: 'bannedTypeMessage',
        data: {
          name,
          customMessage,
        },
        fix: fixWith
          ? (fixer): TSESLint.RuleFix => fixer.replaceText(typeNode, fixWith)
          : null,
        suggest: suggest?.map(replacement => ({
          messageId: 'bannedTypeReplacement',
          data: {
            name,
            replacement,
          },
          fix: (fixer): TSESLint.RuleFix =>
            fixer.replaceText(typeNode, replacement),
        })),
      });
    }

    const keywordSelectors = objectReduceKey(
      TYPE_KEYWORDS,
      (acc: TSESLint.RuleListener, keyword) => {
        if (bannedTypes.has(keyword)) {
          acc[TYPE_KEYWORDS[keyword]] = (node: TSESTree.Node): void =>
            checkBannedTypes(node, keyword);
        }

        return acc;
      },
      {},
    );

    return {
      ...keywordSelectors,

      TSClassImplements(node): void {
        checkBannedTypes(node);
      },
      TSInterfaceHeritage(node): void {
        checkBannedTypes(node);
      },
      TSTupleType(node): void {
        if (!node.elementTypes.length) {
          checkBannedTypes(node);
        }
      },
      TSTypeLiteral(node): void {
        if (!node.members.length) {
          checkBannedTypes(node);
        }
      },
      TSTypeReference(node): void {
        checkBannedTypes(node.typeName);

        if (node.typeArguments) {
          checkBannedTypes(node);
        }
      },
    };
  },
});
