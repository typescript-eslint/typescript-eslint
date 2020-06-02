import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

/**
 * Check whatever node can be considered as simple
 * @param node the node to be evaluated.
 */
function isSimpleType(node: TSESTree.Node): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.TSAnyKeyword:
    case AST_NODE_TYPES.TSBooleanKeyword:
    case AST_NODE_TYPES.TSNeverKeyword:
    case AST_NODE_TYPES.TSNumberKeyword:
    case AST_NODE_TYPES.TSObjectKeyword:
    case AST_NODE_TYPES.TSStringKeyword:
    case AST_NODE_TYPES.TSSymbolKeyword:
    case AST_NODE_TYPES.TSUnknownKeyword:
    case AST_NODE_TYPES.TSVoidKeyword:
    case AST_NODE_TYPES.TSNullKeyword:
    case AST_NODE_TYPES.TSArrayType:
    case AST_NODE_TYPES.TSUndefinedKeyword:
    case AST_NODE_TYPES.TSThisType:
    case AST_NODE_TYPES.TSQualifiedName:
      return true;
    case AST_NODE_TYPES.TSTypeReference:
      if (
        node.typeName &&
        node.typeName.type === AST_NODE_TYPES.Identifier &&
        node.typeName.name === 'Array'
      ) {
        if (!node.typeParameters) {
          return true;
        }
        if (node.typeParameters.params.length === 1) {
          return isSimpleType(node.typeParameters.params[0]);
        }
      } else {
        if (node.typeParameters) {
          return false;
        }
        return isSimpleType(node.typeName);
      }
      return false;
    default:
      return false;
  }
}

/**
 * Check if node needs parentheses
 * @param node the node to be evaluated.
 */
function typeNeedsParentheses(node: TSESTree.Node): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.TSTypeReference:
      return typeNeedsParentheses(node.typeName);
    case AST_NODE_TYPES.TSUnionType:
    case AST_NODE_TYPES.TSFunctionType:
    case AST_NODE_TYPES.TSIntersectionType:
    case AST_NODE_TYPES.TSTypeOperator:
    case AST_NODE_TYPES.TSInferType:
      return true;
    case AST_NODE_TYPES.Identifier:
      return node.name === 'ReadonlyArray';
    default:
      return false;
  }
}

export type OptionString = 'array' | 'generic' | 'array-simple';
type Options = [
  {
    default: OptionString;
    readonly?: OptionString;
  },
];
type MessageIds =
  | 'errorStringGeneric'
  | 'errorStringGenericSimple'
  | 'errorStringArray'
  | 'errorStringArraySimple';

const arrayOption = { enum: ['array', 'generic', 'array-simple'] };

export default util.createRule<Options, MessageIds>({
  name: 'array-type',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Requires using either `T[]` or `Array<T>` for arrays',
      category: 'Stylistic Issues',
      // too opinionated to be recommended
      recommended: false,
    },
    fixable: 'code',
    messages: {
      errorStringGeneric:
        "Array type using '{{type}}[]' is forbidden. Use 'Array<{{type}}>' instead.",
      errorStringGenericSimple:
        "Array type using '{{type}}[]' is forbidden for non-simple types. Use 'Array<{{type}}>' instead.",
      errorStringArray:
        "Array type using 'Array<{{type}}>' is forbidden. Use '{{type}}[]' instead.",
      errorStringArraySimple:
        "Array type using 'Array<{{type}}>' is forbidden for simple types. Use '{{type}}[]' instead.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          default: arrayOption,
          readonly: arrayOption,
        },
      },
    ],
  },
  defaultOptions: [
    {
      default: 'array',
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();

    const defaultOption = options.default;
    const readonlyOption = options.readonly ?? defaultOption;

    const isArraySimpleOption =
      defaultOption === 'array-simple' && readonlyOption === 'array-simple';
    const isArrayOption =
      defaultOption === 'array' && readonlyOption === 'array';
    const isGenericOption =
      defaultOption === 'generic' && readonlyOption === 'generic';

    /**
     * Check if whitespace is needed before this node
     * @param node the node to be evaluated.
     */
    function requireWhitespaceBefore(node: TSESTree.Node): boolean {
      const prevToken = sourceCode.getTokenBefore(node);
      if (!prevToken) {
        return false;
      }

      const nextToken = sourceCode.getTokenAfter(prevToken);
      if (nextToken && sourceCode.isSpaceBetweenTokens(prevToken, nextToken)) {
        return false;
      }

      return prevToken.type === AST_TOKEN_TYPES.Identifier;
    }

    /**
     * @param node the node to be evaluated.
     */
    function getMessageType(node: TSESTree.Node): string {
      if (node) {
        if (node.type === AST_NODE_TYPES.TSParenthesizedType) {
          return getMessageType(node.typeAnnotation);
        }
        if (isSimpleType(node)) {
          return sourceCode.getText(node);
        }
      }
      return 'T';
    }

    /**
     * @param node the node to be evaluated
     */
    function getTypeOpNodeRange(
      node: TSESTree.Node | null,
    ): [number, number] | undefined {
      if (!node) {
        return undefined;
      }

      const firstToken = sourceCode.getFirstToken(node)!;
      const nextToken = sourceCode.getTokenAfter(firstToken)!;
      return [firstToken.range[0], nextToken.range[0]];
    }

    return {
      TSArrayType(node): void {
        if (
          isArrayOption ||
          (isArraySimpleOption && isSimpleType(node.elementType))
        ) {
          return;
        }

        const isReadonly =
          node.parent &&
          node.parent.type === AST_NODE_TYPES.TSTypeOperator &&
          node.parent.operator === 'readonly';

        const isReadonlyGeneric =
          readonlyOption === 'generic' && defaultOption !== 'generic';

        const isReadonlyArray =
          readonlyOption !== 'generic' && defaultOption === 'generic';

        if (
          (isReadonlyGeneric && !isReadonly) ||
          (isReadonlyArray && isReadonly)
        ) {
          return;
        }

        const messageId =
          defaultOption === 'generic'
            ? 'errorStringGeneric'
            : 'errorStringGenericSimple';
        const typeOpNode = isReadonly ? node.parent! : null;

        context.report({
          node: isReadonly ? node.parent! : node,
          messageId,
          data: {
            type: getMessageType(node.elementType),
          },
          fix(fixer) {
            const toFix = [
              fixer.replaceTextRange([node.range[1] - 2, node.range[1]], '>'),
            ];
            const startText = requireWhitespaceBefore(node);
            const typeOpNodeRange = getTypeOpNodeRange(typeOpNode);

            if (typeOpNodeRange) {
              toFix.unshift(fixer.removeRange(typeOpNodeRange));
            } else {
              toFix.push(
                fixer.insertTextBefore(node, `${startText ? ' ' : ''}`),
              );
            }

            toFix.push(
              fixer.insertTextBefore(
                node,
                `${isReadonly ? 'Readonly' : ''}Array<`,
              ),
            );

            if (node.elementType.type === AST_NODE_TYPES.TSParenthesizedType) {
              const first = sourceCode.getFirstToken(node.elementType);
              const last = sourceCode.getLastToken(node.elementType);
              if (!first || !last) {
                return null;
              }

              toFix.push(fixer.remove(first));
              toFix.push(fixer.remove(last));
            }

            return toFix;
          },
        });
      },

      TSTypeReference(node): void {
        if (
          isGenericOption ||
          node.typeName.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const isReadonlyArrayType = node.typeName.name === 'ReadonlyArray';
        const isArrayType = node.typeName.name === 'Array';

        if (
          !(isArrayType || isReadonlyArrayType) ||
          (readonlyOption === 'generic' && isReadonlyArrayType) ||
          (defaultOption === 'generic' && !isReadonlyArrayType)
        ) {
          return;
        }

        const readonlyPrefix = isReadonlyArrayType ? 'readonly ' : '';
        const typeParams = node.typeParameters?.params;
        const messageId =
          defaultOption === 'array'
            ? 'errorStringArray'
            : 'errorStringArraySimple';

        if (!typeParams || typeParams.length === 0) {
          // Create an 'any' array
          context.report({
            node,
            messageId,
            data: {
              type: 'any',
            },
            fix(fixer) {
              return fixer.replaceText(node, `${readonlyPrefix}any[]`);
            },
          });

          return;
        }

        if (
          typeParams.length !== 1 ||
          (defaultOption === 'array-simple' && !isSimpleType(typeParams[0]))
        ) {
          return;
        }

        const type = typeParams[0];
        const parens = typeNeedsParentheses(type);

        context.report({
          node,
          messageId,
          data: {
            type: getMessageType(type),
          },
          fix(fixer) {
            return [
              fixer.replaceTextRange(
                [node.range[0], type.range[0]],
                `${readonlyPrefix}${parens ? '(' : ''}`,
              ),
              fixer.replaceTextRange(
                [type.range[1], node.range[1]],
                parens ? ')[]' : '[]',
              ),
            ];
          },
        });
      },
    };
  },
});
