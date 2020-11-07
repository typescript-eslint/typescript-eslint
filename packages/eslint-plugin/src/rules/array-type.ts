import {
  AST_NODE_TYPES,
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
      TSArrayType(node): void {
        const isReadonly =
          node.parent &&
          node.parent.type === AST_NODE_TYPES.TSTypeOperator &&
          node.parent.operator === 'readonly';

        const currentOption = isReadonly ? readonlyOption : defaultOption;

        if (
          currentOption === 'array' ||
          (currentOption === 'array-simple' && isSimpleType(node.elementType))
        ) {
          return;
        }

        const messageId =
          currentOption === 'generic'
            ? 'errorStringGeneric'
            : 'errorStringGenericSimple';
        const errorNode = isReadonly ? node.parent! : node;

        context.report({
          node: errorNode,
          messageId,
          data: {
            type: getMessageType(node.elementType),
          },
          fix(fixer) {
            const typeNode =
              node.elementType.type === AST_NODE_TYPES.TSParenthesizedType
                ? node.elementType.typeAnnotation
                : node.elementType;

            const arrayType = isReadonly ? 'ReadonlyArray' : 'Array';

            return [
              fixer.replaceTextRange(
                [errorNode.range[0], typeNode.range[0]],
                `${arrayType}<`,
              ),
              fixer.replaceTextRange(
                [typeNode.range[1], errorNode.range[1]],
                '>',
              ),
            ];
          },
        });
      },

      TSTypeReference(node): void {
        if (
          node.typeName.type !== AST_NODE_TYPES.Identifier ||
          !(
            node.typeName.name === 'Array' ||
            node.typeName.name === 'ReadonlyArray'
          )
        ) {
          return;
        }

        const isReadonlyArrayType = node.typeName.name === 'ReadonlyArray';
        const currentOption = isReadonlyArrayType
          ? readonlyOption
          : defaultOption;

        if (currentOption === 'generic') {
          return;
        }

        const readonlyPrefix = isReadonlyArrayType ? 'readonly ' : '';
        const typeParams = node.typeParameters?.params;
        const messageId =
          currentOption === 'array'
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
          (currentOption === 'array-simple' && !isSimpleType(typeParams[0]))
        ) {
          return;
        }

        const type = typeParams[0];
        const typeParens = typeNeedsParentheses(type);
        const parentParens =
          readonlyPrefix && node.parent?.type === AST_NODE_TYPES.TSArrayType;

        const start = `${parentParens ? '(' : ''}${readonlyPrefix}${
          typeParens ? '(' : ''
        }`;
        const end = `${typeParens ? ')' : ''}[]${parentParens ? ')' : ''}`;

        context.report({
          node,
          messageId,
          data: {
            type: getMessageType(type),
          },
          fix(fixer) {
            return [
              fixer.replaceTextRange([node.range[0], type.range[0]], start),
              fixer.replaceTextRange([type.range[1], node.range[1]], end),
            ];
          },
        });
      },
    };
  },
});
