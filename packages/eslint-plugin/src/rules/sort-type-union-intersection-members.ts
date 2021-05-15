import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import { getEnumNames } from '../util';

enum Group {
  conditional = 'conditional',
  function = 'function',
  import = 'import',
  intersection = 'intersection',
  keyword = 'keyword',
  nullish = 'nullish',
  literal = 'literal',
  named = 'named',
  object = 'object',
  operator = 'operator',
  tuple = 'tuple',
  union = 'union',
}

function getGroup(node: TSESTree.TypeNode): Group {
  switch (node.type) {
    case AST_NODE_TYPES.TSParenthesizedType:
      return getGroup(node.typeAnnotation);

    case AST_NODE_TYPES.TSConditionalType:
      return Group.conditional;

    case AST_NODE_TYPES.TSConstructorType:
    case AST_NODE_TYPES.TSFunctionType:
      return Group.function;

    case AST_NODE_TYPES.TSImportType:
      return Group.import;

    case AST_NODE_TYPES.TSIntersectionType:
      return Group.intersection;

    case AST_NODE_TYPES.TSAnyKeyword:
    case AST_NODE_TYPES.TSBigIntKeyword:
    case AST_NODE_TYPES.TSBooleanKeyword:
    case AST_NODE_TYPES.TSNeverKeyword:
    case AST_NODE_TYPES.TSNumberKeyword:
    case AST_NODE_TYPES.TSObjectKeyword:
    case AST_NODE_TYPES.TSStringKeyword:
    case AST_NODE_TYPES.TSSymbolKeyword:
    case AST_NODE_TYPES.TSThisType:
    case AST_NODE_TYPES.TSUnknownKeyword:
    case AST_NODE_TYPES.TSIntrinsicKeyword:
      return Group.keyword;

    case AST_NODE_TYPES.TSNullKeyword:
    case AST_NODE_TYPES.TSUndefinedKeyword:
    case AST_NODE_TYPES.TSVoidKeyword:
      return Group.nullish;

    case AST_NODE_TYPES.TSLiteralType:
    case AST_NODE_TYPES.TSTemplateLiteralType:
      return Group.literal;

    case AST_NODE_TYPES.TSArrayType:
    case AST_NODE_TYPES.TSIndexedAccessType:
    case AST_NODE_TYPES.TSInferType:
    case AST_NODE_TYPES.TSTypeReference:
      return Group.named;

    case AST_NODE_TYPES.TSMappedType:
    case AST_NODE_TYPES.TSTypeLiteral:
      return Group.object;

    case AST_NODE_TYPES.TSTypeOperator:
    case AST_NODE_TYPES.TSTypeQuery:
      return Group.operator;

    case AST_NODE_TYPES.TSTupleType:
      return Group.tuple;

    case AST_NODE_TYPES.TSUnionType:
      return Group.union;

    // These types should never occur as part of a union/intersection
    case AST_NODE_TYPES.TSNamedTupleMember:
    case AST_NODE_TYPES.TSOptionalType:
    case AST_NODE_TYPES.TSRestType:
    case AST_NODE_TYPES.TSTypePredicate:
      /* istanbul ignore next */
      throw new Error(`Unexpected Type ${node.type}`);
  }
}

export type Options = [
  {
    checkIntersections?: boolean;
    checkUnions?: boolean;
    groupOrder?: string[];
  },
];
export type MessageIds = 'notSorted' | 'notSortedNamed' | 'suggestFix';

export default util.createRule<Options, MessageIds>({
  name: 'sort-type-union-intersection-members',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces that members of a type union/intersection are sorted alphabetically',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      notSorted: '{{type}} type members must be sorted.',
      notSortedNamed: '{{type}} type {{name}} members must be sorted.',
      suggestFix: 'Sort members of type (removes all comments).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkIntersections: {
            type: 'boolean',
          },
          checkUnions: {
            type: 'boolean',
          },
          groupOrder: {
            type: 'array',
            items: {
              type: 'string',
              enum: getEnumNames(Group),
            },
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      checkIntersections: true,
      checkUnions: true,
      groupOrder: [
        Group.named,
        Group.keyword,
        Group.operator,
        Group.literal,
        Group.function,
        Group.import,
        Group.conditional,
        Group.object,
        Group.tuple,
        Group.intersection,
        Group.union,
        Group.nullish,
      ],
    },
  ],
  create(context, [{ checkIntersections, checkUnions, groupOrder }]) {
    const sourceCode = context.getSourceCode();

    const collator = new Intl.Collator('en', {
      sensitivity: 'base',
      numeric: true,
    });

    function checkSorting(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
    ): void {
      const sourceOrder = node.types.map(type => {
        const group = groupOrder?.indexOf(getGroup(type)) ?? -1;
        return {
          group: group === -1 ? Number.MAX_SAFE_INTEGER : group,
          node: type,
          text: sourceCode.getText(type),
        };
      });
      const expectedOrder = [...sourceOrder].sort((a, b) => {
        if (a.group !== b.group) {
          return a.group - b.group;
        }

        return (
          collator.compare(a.text, b.text) ||
          (a.text < b.text ? -1 : a.text > b.text ? 1 : 0)
        );
      });

      const hasComments = node.types.some(type => {
        const count =
          sourceCode.getCommentsBefore(type).length +
          sourceCode.getCommentsAfter(type).length;
        return count > 0;
      });

      for (let i = 0; i < expectedOrder.length; i += 1) {
        if (expectedOrder[i].node !== sourceOrder[i].node) {
          let messageId: MessageIds = 'notSorted';
          const data = {
            name: '',
            type:
              node.type === AST_NODE_TYPES.TSIntersectionType
                ? 'Intersection'
                : 'Union',
          };
          if (node.parent?.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            messageId = 'notSortedNamed';
            data.name = node.parent.id.name;
          }

          const fix: TSESLint.ReportFixFunction = fixer => {
            const sorted = expectedOrder
              .map(t => t.text)
              .join(
                node.type === AST_NODE_TYPES.TSIntersectionType ? ' & ' : ' | ',
              );

            return fixer.replaceText(node, sorted);
          };
          return context.report({
            node,
            messageId,
            data,
            // don't autofix if any of the types have leading/trailing comments
            // the logic for preserving them correctly is a pain - we may implement this later
            ...(hasComments
              ? {
                  suggest: [
                    {
                      messageId: 'suggestFix',
                      fix,
                    },
                  ],
                }
              : { fix }),
          });
        }
      }
    }

    return {
      TSIntersectionType(node): void {
        if (checkIntersections === true) {
          checkSorting(node);
        }
      },
      TSUnionType(node): void {
        if (checkUnions === true) {
          checkSorting(node);
        }
      },
    };
  },
});
