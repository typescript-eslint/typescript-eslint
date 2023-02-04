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
    if (Array.isArray(actualNode) && Array.isArray(expectedNode)) {
      if (actualNode.length != expectedNode.length) {
        return false;
      }
      return !actualNode.some(
        (nodeEle, index) => !isSameAstNode(nodeEle, expectedNode[index]),
      );
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
            actualNode[actualNodeKey as keyof typeof actualNode],
            expectedNode[actualNodeKey as keyof typeof expectedNode],
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
      duplicate:
        '{{type}} type constituents {{duplicated}} is duplicated with {{previous}}.',
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
      const duplicateConstituents: {
        duplicated: TSESTree.TypeNode;
        duplicatePrevious: TSESTree.TypeNode;
      }[] = [];

      node.types.reduce<
        {
          node: TSESTree.TypeNode;
          type: Type;
        }[]
      >((uniqConstituents, constituentNode) => {
        const type = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(constituentNode),
        );
        const duplicatePreviousConstituent = uniqConstituents.find(
          ele => isSameAstNode(ele.node, constituentNode) || ele.type === type,
        );
        if (duplicatePreviousConstituent) {
          duplicateConstituents.push({
            duplicated: constituentNode,
            duplicatePrevious: duplicatePreviousConstituent.node,
          });
          return uniqConstituents;
        }
        return [...uniqConstituents, { node: constituentNode, type }];
      }, []);

      const fix: TSESLint.ReportFixFunction = fixer => {
        return duplicateConstituents
          .map(duplicateConstituent => {
            const fixes: TSESLint.RuleFix[] = [];
            const beforeTokens = sourceCode.getTokensBefore(
              duplicateConstituent.duplicated,
            );
            const afterTokens = sourceCode.getTokensAfter(
              duplicateConstituent.duplicated,
            );
            const beforeUnionOrIntersectionToken = beforeTokens
              .reverse()
              .find(token => token.value === '|' || token.value === '&');

            if (beforeUnionOrIntersectionToken) {
              const bracketBeforeTokens = sourceCode.getTokensBetween(
                beforeUnionOrIntersectionToken,
                duplicateConstituent.duplicated,
              );
              const bracketAfterTokens = afterTokens.slice(
                0,
                bracketBeforeTokens.length,
              );
              [
                beforeUnionOrIntersectionToken,
                ...bracketBeforeTokens,
                duplicateConstituent.duplicated,
                ...bracketAfterTokens,
              ].forEach(token => fixes.push(fixer.remove(token)));
            }
            return fixes;
          })
          .flat();
      };

      duplicateConstituents.forEach(duplicateConstituent => {
        context.report({
          data: {
            duplicated: sourceCode.getText(duplicateConstituent.duplicated),
            type:
              node.type === AST_NODE_TYPES.TSIntersectionType
                ? 'Intersection'
                : 'Union',
            previous: sourceCode.getText(
              duplicateConstituent.duplicatePrevious,
            ),
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
