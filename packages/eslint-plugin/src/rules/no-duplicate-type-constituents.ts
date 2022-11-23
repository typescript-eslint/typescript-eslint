import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { Type } from 'typescript';

import * as util from '../util';

export type Options = [
  {
    ignoreIntersections?: boolean;
    ignoreUnions?: boolean;
  },
];

export type MessageIds = 'duplicate';

const isRecordType = (
  object: object,
): object is Record<string | symbol, unknown> => {
  return object.constructor === Object;
};

const astIgnoreKeys = ['range', 'loc', 'parent'];

const isSameAstNode = (actualNode: unknown, expectedNode: unknown): boolean => {
  if (actualNode === expectedNode) {
    return true;
  }
  if (
    actualNode &&
    expectedNode &&
    typeof actualNode == 'object' &&
    typeof expectedNode == 'object'
  ) {
    if (actualNode.constructor !== expectedNode.constructor) {
      return false;
    }
    if (Array.isArray(actualNode) && Array.isArray(expectedNode)) {
      if (actualNode.length != expectedNode.length) {
        return false;
      }
      return !actualNode.some(
        (nodeEle, index) => !isSameAstNode(nodeEle, expectedNode[index]),
      );
    }
    if (!isRecordType(actualNode) || !isRecordType(expectedNode)) {
      return false;
    }
    const actualNodeKeys = Object.keys(actualNode).filter(
      key => !astIgnoreKeys.includes(key),
    );
    const expectedNodeKeys = Object.keys(expectedNode).filter(
      key => !astIgnoreKeys.includes(key),
    );
    if (actualNodeKeys.length !== expectedNodeKeys.length) {
      return false;
    }
    if (
      actualNodeKeys.some(
        actualNodeKey =>
          !Object.prototype.hasOwnProperty.call(expectedNode, actualNodeKey),
      )
    ) {
      return false;
    }
    if (
      actualNodeKeys.some(
        actualNodeKey =>
          !isSameAstNode(
            actualNode[actualNodeKey],
            expectedNode[actualNodeKey],
          ),
      )
    ) {
      return false;
    }
    return true;
  }
  return false;
};

export default util.createRule<Options, MessageIds>({
  name: 'no-duplicate-type-constituents',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow duplicate constituents of union or intersection types',
      recommended: false,
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      duplicate: '{{type}} type member {{name}} is duplicated.',
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
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function checkDuplicate(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
    ): void {
      const uniqConstituentTypes = new Set<Type>();
      const duplicateConstituentNodes: TSESTree.TypeNode[] = [];

      node.types.reduce<TSESTree.TypeNode[]>(
        (uniqConstituentNodes, constituentNode) => {
          const type = checker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(constituentNode),
          );
          if (
            uniqConstituentNodes.some(ele =>
              isSameAstNode(ele, constituentNode),
            ) ||
            uniqConstituentTypes.has(type)
          ) {
            duplicateConstituentNodes.push(constituentNode);
            return uniqConstituentNodes;
          }
          uniqConstituentTypes.add(type);
          return [...uniqConstituentNodes, constituentNode];
        },
        [],
      );

      const fix: TSESLint.ReportFixFunction = fixer => {
        return duplicateConstituentNodes
          .map(duplicateConstituentNode => {
            const fixes: TSESLint.RuleFix[] = [];
            const beforeTokens = sourceCode.getTokensBefore(
              duplicateConstituentNode,
            );
            const afterTokens = sourceCode.getTokensAfter(
              duplicateConstituentNode,
            );
            const beforeUnionOrIntersectionToken = beforeTokens
              .reverse()
              .find(token => token.value === '|' || token.value === '&');

            if (beforeUnionOrIntersectionToken) {
              const bracketBeforeTokens = sourceCode.getTokensBetween(
                beforeUnionOrIntersectionToken,
                duplicateConstituentNode,
              );
              const bracketAfterTokens = afterTokens.slice(
                0,
                bracketBeforeTokens.length,
              );
              [
                beforeUnionOrIntersectionToken,
                ...bracketBeforeTokens,
                duplicateConstituentNode,
                ...bracketAfterTokens,
              ].forEach(token => fixes.push(fixer.remove(token)));
            }
            return fixes;
          })
          .flat();
      };

      duplicateConstituentNodes.forEach(duplicateConstituentNode => {
        context.report({
          data: {
            name: sourceCode.getText(duplicateConstituentNode),
            type:
              node.type === AST_NODE_TYPES.TSIntersectionType
                ? 'Intersection'
                : 'Union',
          },
          messageId: 'duplicate',
          node,
          fix,
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
