import {
  TSESLint,
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Types = Record<
  string,
  | null
  | false
  | string
  | {
      message: string;
      fixWith?: string;
    }
>;

export type Options = [
  {
    types?: Types;
    extendDefaults?: boolean;
  },
];
export type MessageIds = 'bannedTypeMessage';

function removeSpaces(str: string): string {
  return str.replace(/ /g, '');
}

function stringifyTypeName(
  node: TSESTree.Node,
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

const defaultTypes: Types = {
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
  Symbol: {
    message: 'Use symbol instead',
    fixWith: 'symbol',
  },

  Function: {
    message: [
      'The `Function` type accepts any function-like value.',
      'It provides no type safety when calling the function, which can be a common source of bugs.',
      'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
      'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
    ].join('\n'),
  },

  // object typing
  Object: {
    message: [
      'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
      '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
      '- If you want a type meaning "any value", you probably want `unknown` instead.',
    ].join('\n'),
  },
  '{}': {
    message: [
      '`{}` actually means "any non-nullish value".',
      '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
      '- If you want a type meaning "any value", you probably want `unknown` instead.',
    ].join('\n'),
  },
  object: {
    message: [
      'The `object` type is currently hard to use ([see this issue](https://github.com/microsoft/TypeScript/issues/21732)).',
      'Consider using `Record<string, unknown>` instead, as it allows you to more easily inspect and use the keys.',
    ].join('\n'),
  },
};

export const TYPE_KEYWORDS = {
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
      bannedTypeMessage: "Don't use `{{name}}` as a type.{{customMessage}}",
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
                { type: 'boolean' },
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
          extendDefaults: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const extendDefaults = options.extendDefaults ?? true;
    const customTypes = options.types ?? {};
    const types = Object.assign(
      {},
      extendDefaults ? defaultTypes : {},
      customTypes,
    );
    const bannedTypes = new Map(
      Object.entries(types).map(([type, data]) => [removeSpaces(type), data]),
    );

    function checkBannedTypes(
      typeNode: TSESTree.Node,
      name = stringifyTypeName(typeNode, context.getSourceCode()),
    ): void {
      const bannedType = bannedTypes.get(name);

      if (bannedType === undefined || bannedType === false) {
        return;
      }

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
        fix: fixWith
          ? (fixer): TSESLint.RuleFix => fixer.replaceText(typeNode, fixWith)
          : null,
      });
    }

    const keywordSelectors = util.objectReduceKey(
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
