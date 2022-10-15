import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

const nodeTypesAreEqual = <T extends TSESTree.Node>(
  actualTypeNode: TSESTree.Node,
  expectedTypeNode: T,
): actualTypeNode is T => {
  return actualTypeNode.type === expectedTypeNode.type;
};

const constituentsAreEqual = (
  actualTypeNode: TSESTree.TypeNode,
  expectedTypeNode: TSESTree.TypeNode,
): boolean => {
  switch (expectedTypeNode.type) {
    // These types should never occur as constituents of a union/intersection
    case AST_NODE_TYPES.TSAbstractKeyword:
    case AST_NODE_TYPES.TSAsyncKeyword:
    case AST_NODE_TYPES.TSDeclareKeyword:
    case AST_NODE_TYPES.TSExportKeyword:
    case AST_NODE_TYPES.TSNamedTupleMember:
    case AST_NODE_TYPES.TSOptionalType:
    case AST_NODE_TYPES.TSPrivateKeyword:
    case AST_NODE_TYPES.TSProtectedKeyword:
    case AST_NODE_TYPES.TSPublicKeyword:
    case AST_NODE_TYPES.TSReadonlyKeyword:
    case AST_NODE_TYPES.TSRestType:
    case AST_NODE_TYPES.TSStaticKeyword:
    case AST_NODE_TYPES.TSTypePredicate:
      /* istanbul ignore next */
      throw new Error(`Unexpected Type ${expectedTypeNode.type}`);

    default:
      if (nodeTypesAreEqual(actualTypeNode, expectedTypeNode)) {
        return astNodesAreEquals(actualTypeNode, expectedTypeNode);
      }
      return false;
  }
};

const astIgnoreKeys = ['range', 'loc', 'parent'];

const astNodesAreEquals = (
  actualNode: unknown,
  expectedNode: unknown,
): boolean => {
  if (actualNode === expectedNode) {
    return true;
  }
  if (
    actualNode &&
    expectedNode &&
    typeof actualNode == 'object' &&
    typeof expectedNode == 'object'
  ) {
    if (Array.isArray(actualNode) && Array.isArray(expectedNode)) {
      if (actualNode.length != expectedNode.length) {
        return false;
      }
      return !actualNode.some(
        (nodeEle, index) => !astNodesAreEquals(nodeEle, expectedNode[index]),
      );
    }
    if (isRecordType(actualNode) && isRecordType(expectedNode)) {
      const actualNodeKeys = Object.keys(actualNode).filter(
        key => !astIgnoreKeys.includes(key),
      );
      const expectedNodeKeys = Object.keys(expectedNode).filter(
        key => !astIgnoreKeys.includes(key),
      );
      if (actualNodeKeys.length === expectedNodeKeys.length) {
        return !actualNodeKeys.some(
          actualNodeKey =>
            !astNodesAreEquals(
              actualNode[actualNodeKey],
              expectedNode[actualNodeKey],
            ),
        );
      }
    }
  }
  return false;
};

const isRecordType = (
  object: object,
): object is Record<string | symbol, unknown> => {
  return object.constructor === Object;
};

export type Options = [
  {
    ignoreIntersections?: boolean;
    ignoreUnions?: boolean;
  },
];

export type MessageIds = 'duplicate' | 'suggestFix';

export default util.createRule<Options, MessageIds>({
  name: 'no-duplicate-type-constituents',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow duplicate union/intersection type constituents',
      recommended: false,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      duplicate: '{{type}} type member {{name}} is duplicated.',
      suggestFix:
        'Delete duplicated constituents of type (removes all comments).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreIntersections: {
            type: 'boolean',
          },
          ignoreUnions: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      ignoreIntersections: false,
      ignoreUnions: false,
    },
  ],
  create(context, [{ ignoreIntersections, ignoreUnions }]) {
    const sourceCode = context.getSourceCode();
    function checkDuplicate(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
    ): void {
      const duplicateConstituents: {
        node: TSESTree.TypeNode;
        index: number;
      }[] = [];

      node.types.reduce<TSESTree.TypeNode[]>((acc, cur, index) => {
        if (acc.some(ele => constituentsAreEqual(ele, cur))) {
          duplicateConstituents.push({ node: cur, index });
          return acc;
        }
        return [...acc, cur];
      }, []);

      const hasComments = node.types.some(type => {
        const count =
          sourceCode.getCommentsBefore(type).length +
          sourceCode.getCommentsAfter(type).length;
        return count > 0;
      });

      const fix: TSESLint.ReportFixFunction = fixer => {
        return duplicateConstituents.map(duplicateConstituent => {
          const parent = duplicateConstituent.node.parent as
            | TSESTree.TSUnionType
            | TSESTree.TSIntersectionType;
          const delteRangeStart =
            parent.types[duplicateConstituent.index - 1].range[1];
          return fixer.removeRange([
            delteRangeStart,
            duplicateConstituent.node.range[1],
          ]);
        });
      };

      duplicateConstituents.forEach(duplicateConstituent => {
        context.report({
          data: {
            name: sourceCode.getText(duplicateConstituent.node),
            type:
              node.type === AST_NODE_TYPES.TSIntersectionType
                ? 'Intersection'
                : 'Union',
          },
          messageId: 'duplicate',
          node,
          // don't autofix if any of the types have leading/trailing comments
          ...(hasComments
            ? {
                suggest: [
                  {
                    fix,
                    messageId: 'suggestFix',
                  },
                ],
              }
            : {
                fix,
              }),
        });
      });
    }
    return {
      ...(!ignoreIntersections && {
        TSIntersectionType: checkDuplicate,
      }),
      ...(!ignoreUnions && {
        TSUnionType: checkDuplicate,
      }),
    };
  },
});
