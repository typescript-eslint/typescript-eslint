import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { Type } from 'typescript';

import { createRule, getParserServices } from '../util';

export type Options = [
  { ignoreIntersections?: boolean; ignoreUnions?: boolean },
];

export type MessageIds = 'duplicate' | 'unnecessary';

const astIgnoreKeys = new Set(['range', 'loc', 'parent']);

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
      key => !astIgnoreKeys.has(key),
    );
    const expectedNodeKeys = Object.keys(expectedNode).filter(
      key => !astIgnoreKeys.has(key),
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

export default createRule<Options, MessageIds>({
  name: 'no-duplicate-type-constituents',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow duplicate constituents of union or intersection types',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      duplicate: '{{type}} type constituent is duplicated with {{previous}}.',
      unnecessary:
        'Explicit undefined is unnecessary on an optional parameter.',
    },
    schema: [
      {
        additionalProperties: false,
        type: 'object',
        properties: {
          ignoreIntersections: { type: 'boolean' },
          ignoreUnions: { type: 'boolean' },
        },
      },
    ],
  },
  defaultOptions: [{ ignoreIntersections: false, ignoreUnions: false }],
  create(context, [{ ignoreIntersections, ignoreUnions }]) {
    const parserServices = getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const { sourceCode } = context;

    function checkDuplicate(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
    ): void {
      const cachedTypeMap = new Map<Type, TSESTree.TypeNode>();
      node.types.reduce<TSESTree.TypeNode[]>(
        (uniqueConstituents, constituentNode) => {
          const reportIfDuplicate = (
            duplicatePrevious?: TSESTree.TypeNode,
            // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
          ): true | void => {
            if (duplicatePrevious) {
              report('duplicate', constituentNode, {
                type:
                  node.type === AST_NODE_TYPES.TSIntersectionType
                    ? 'Intersection'
                    : 'Union',
                previous: sourceCode.getText(duplicatePrevious),
              });
              return true;
            }
          };
          if (
            reportIfDuplicate(
              uniqueConstituents.find(ele =>
                isSameAstNode(ele, constituentNode),
              ),
            )
          ) {
            return uniqueConstituents;
          }
          const constituentNodeType = checker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(constituentNode),
          );
          if (reportIfDuplicate(cachedTypeMap.get(constituentNodeType))) {
            return uniqueConstituents;
          }
          cachedTypeMap.set(constituentNodeType, constituentNode);
          return [...uniqueConstituents, constituentNode];
        },
        [],
      );
    }
    function report(
      messageId: MessageIds,
      node: TSESTree.TypeNode,
      data?: Record<string, unknown>,
    ): void {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const beforeUnionOrIntersectionToken = sourceCode
        .getTokensBefore(node, {
          filter: token => ['|', '&'].includes(token.value),
        })
        .at(-1)!;
      const bracketBeforeTokens = sourceCode.getTokensBetween(
        beforeUnionOrIntersectionToken,
        node,
      );
      const bracketAfterTokens = sourceCode.getTokensAfter(node, {
        count: bracketBeforeTokens.length,
      });
      context.report({
        data,
        messageId,
        node,
        loc: {
          start: node.loc.start,
          end: (bracketAfterTokens.at(-1) ?? node).loc.end,
        },
        fix: fixer =>
          [
            beforeUnionOrIntersectionToken,
            ...bracketBeforeTokens,
            node,
            ...bracketAfterTokens,
          ].map(token => fixer.remove(token)),
      });
    }
    return {
      ...(!ignoreIntersections && { TSIntersectionType: checkDuplicate }),
      ...(!ignoreUnions && {
        TSUnionType(node): void {
          checkDuplicate(node);
          const maybeTypeAnnotation = node.parent;
          if (maybeTypeAnnotation.type === AST_NODE_TYPES.TSTypeAnnotation) {
            const maybeIdentifier = maybeTypeAnnotation.parent;
            if (
              maybeIdentifier.type === AST_NODE_TYPES.Identifier &&
              maybeIdentifier.optional
            ) {
              const maybeFunction = maybeIdentifier.parent;
              const { type } = maybeFunction;
              if (
                (type === AST_NODE_TYPES.ArrowFunctionExpression ||
                  type === AST_NODE_TYPES.FunctionDeclaration ||
                  type === AST_NODE_TYPES.FunctionExpression) &&
                maybeFunction.params.includes(maybeIdentifier)
              ) {
                const explicitUndefined = node.types.find(
                  ({ type }) => type === AST_NODE_TYPES.TSUndefinedKeyword,
                );
                if (explicitUndefined) {
                  report('unnecessary', explicitUndefined);
                }
              }
            }
          }
        },
      }),
    };
  },
});
