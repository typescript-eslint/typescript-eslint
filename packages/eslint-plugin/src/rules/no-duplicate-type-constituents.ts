import type { TSESTree } from '@typescript-eslint/utils';
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
    typeof actualNode === 'object' &&
    typeof expectedNode === 'object'
  ) {
    if (Array.isArray(actualNode) && Array.isArray(expectedNode)) {
      if (actualNode.length !== expectedNode.length) {
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
        additionalProperties: false,
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
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function checkDuplicate(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
    ): void {
      const cachedTypeMap: Map<TSESTree.TypeNode, Type> = new Map();
      node.types.reduce<TSESTree.TypeNode[]>(
        (uniqConstituents, constituentNode) => {
          const duplicatedPreviousConstituentInAst = uniqConstituents.find(
            ele => isSameAstNode(ele, constituentNode),
          );
          if (duplicatedPreviousConstituentInAst) {
            reportDuplicate(
              {
                duplicated: constituentNode,
                duplicatePrevious: duplicatedPreviousConstituentInAst,
              },
              node,
            );
            return uniqConstituents;
          }
          const constituentNodeType = checker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(constituentNode),
          );
          const duplicatedPreviousConstituentInType = [
            ...cachedTypeMap.entries(),
          ].find(([, type]) => {
            return type === constituentNodeType;
          })?.[0];
          if (duplicatedPreviousConstituentInType) {
            reportDuplicate(
              {
                duplicated: constituentNode,
                duplicatePrevious: duplicatedPreviousConstituentInType,
              },
              node,
            );
            return uniqConstituents;
          }
          cachedTypeMap.set(constituentNode, constituentNodeType);
          return [...uniqConstituents, constituentNode];
        },
        [],
      );
    }
    function reportDuplicate(
      duplicateConstituent: {
        duplicated: TSESTree.TypeNode;
        duplicatePrevious: TSESTree.TypeNode;
      },
      parentNode: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
    ): void {
      const sourceCode = context.getSourceCode();
      const beforeTokens = sourceCode.getTokensBefore(
        duplicateConstituent.duplicated,
        { filter: token => token.value === '|' || token.value === '&' },
      );
      const beforeUnionOrIntersectionToken =
        beforeTokens[beforeTokens.length - 1];
      const bracketBeforeTokens = sourceCode.getTokensBetween(
        beforeUnionOrIntersectionToken,
        duplicateConstituent.duplicated,
      );
      const bracketAfterTokens = sourceCode.getTokensAfter(
        duplicateConstituent.duplicated,
        { count: bracketBeforeTokens.length },
      );
      const reportLocation: TSESTree.SourceLocation = {
        start: beforeUnionOrIntersectionToken.loc.start,
        end:
          bracketAfterTokens.length > 0
            ? bracketAfterTokens[bracketAfterTokens.length - 1].loc.end
            : duplicateConstituent.duplicated.loc.end,
      };
      context.report({
        data: {
          duplicated: sourceCode.getText(duplicateConstituent.duplicated),
          type:
            parentNode.type === AST_NODE_TYPES.TSIntersectionType
              ? 'Intersection'
              : 'Union',
          previous: sourceCode.getText(duplicateConstituent.duplicatePrevious),
        },
        messageId: 'duplicate',
        node: duplicateConstituent.duplicated,
        loc: reportLocation,
        fix: fixer => {
          return [
            beforeUnionOrIntersectionToken,
            ...bracketBeforeTokens,
            duplicateConstituent.duplicated,
            ...bracketAfterTokens,
          ].map(token => fixer.remove(token));
        },
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
