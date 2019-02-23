import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
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
    default:
      return false;
  }
}

type Options = ['array' | 'generic' | 'array-simple'];
type MessageIds =
  | 'errorStringGeneric'
  | 'errorStringGenericSimple'
  | 'errorStringArray'
  | 'errorStringArraySimple';

export default util.createRule<Options, MessageIds>({
  name: 'array-type',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Requires using either `T[]` or `Array<T>` for arrays',
      tslintRuleName: 'array-type',
      category: 'Stylistic Issues',
      recommended: 'error',
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
        enum: ['array', 'generic', 'array-simple'],
      },
    ],
  },
  defaultOptions: ['array'],
  create(context, [option]) {
    const sourceCode = context.getSourceCode();

    /**
     * Check if whitespace is needed before this node
     * @param node the node to be evaluated.
     */
    function requireWhitespaceBefore(node: TSESTree.Node): boolean {
      const prevToken = sourceCode.getTokenBefore(node);
      if (!prevToken) {
        return false;
      }

      if (node.range[0] - prevToken.range[1] > 0) {
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

    return {
      TSArrayType(node) {
        if (
          option === 'array' ||
          (option === 'array-simple' && isSimpleType(node.elementType))
        ) {
          return;
        }
        const messageId =
          option === 'generic'
            ? 'errorStringGeneric'
            : 'errorStringGenericSimple';

        context.report({
          node,
          messageId,
          data: {
            type: getMessageType(node.elementType),
          },
          fix(fixer) {
            const startText = requireWhitespaceBefore(node);
            const toFix = [
              fixer.replaceTextRange([node.range[1] - 2, node.range[1]], '>'),
              fixer.insertTextBefore(node, `${startText ? ' ' : ''}Array<`),
            ];

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
      TSTypeReference(node: TSESTree.TSTypeReference) {
        if (
          option === 'generic' ||
          node.typeName.type !== AST_NODE_TYPES.Identifier ||
          node.typeName.name !== 'Array'
        ) {
          return;
        }
        const messageId =
          option === 'array' ? 'errorStringArray' : 'errorStringArraySimple';

        const typeParams = node.typeParameters && node.typeParameters.params;

        if (!typeParams || typeParams.length === 0) {
          // Create an 'any' array
          context.report({
            node,
            messageId,
            data: {
              type: 'any',
            },
            fix(fixer) {
              return fixer.replaceText(node, 'any[]');
            },
          });
          return;
        }

        if (
          typeParams.length !== 1 ||
          (option === 'array-simple' && !isSimpleType(typeParams[0]))
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
                parens ? '(' : '',
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
