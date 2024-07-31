import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import { isTypeFlagSet } from 'ts-api-utils';
import type { Type } from 'typescript';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type Options = [
  {
    ignoreIntersections?: boolean;
    ignoreUnions?: boolean;
  },
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
    const parserServices = getParserServices(context);
    const { sourceCode } = context;

    function checkDuplicate(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
      forEachNodeType?: (
        constituentNodeType: Type,
        report: (messageId: MessageIds) => void,
      ) => void,
    ): void {
      const cachedTypeMap = new Map<Type, TSESTree.TypeNode>();
      node.types.reduce<TSESTree.TypeNode[]>(
        (uniqueConstituents, constituentNode) => {
          const constituentNodeType =
            parserServices.getTypeAtLocation(constituentNode);
          if (tsutils.isIntrinsicErrorType(constituentNodeType)) {
            return uniqueConstituents;
          }

          const report = (
            messageId: MessageIds,
            data?: Record<string, unknown>,
          ): void => {
            const getUnionOrIntersectionToken = (
              where: 'Before' | 'After',
              at: number,
            ): TSESTree.Token | undefined =>
              sourceCode[`getTokens${where}`](constituentNode, {
                filter: token => ['|', '&'].includes(token.value),
              }).at(at);

            const beforeUnionOrIntersectionToken = getUnionOrIntersectionToken(
              'Before',
              -1,
            );
            let afterUnionOrIntersectionToken: TSESTree.Token | undefined;
            let bracketBeforeTokens;
            let bracketAfterTokens;
            if (beforeUnionOrIntersectionToken) {
              bracketBeforeTokens = sourceCode.getTokensBetween(
                beforeUnionOrIntersectionToken,
                constituentNode,
              );
              bracketAfterTokens = sourceCode.getTokensAfter(constituentNode, {
                count: bracketBeforeTokens.length,
              });
            } else {
              afterUnionOrIntersectionToken = nullThrows(
                getUnionOrIntersectionToken('After', 0),
                NullThrowsReasons.MissingToken(
                  'union or intersection token',
                  'duplicate type constituent',
                ),
              );
              bracketAfterTokens = sourceCode.getTokensBetween(
                constituentNode,
                afterUnionOrIntersectionToken,
              );
              bracketBeforeTokens = sourceCode.getTokensBefore(
                constituentNode,
                {
                  count: bracketAfterTokens.length,
                },
              );
            }
            context.report({
              data,
              messageId,
              node: constituentNode,
              loc: {
                start: constituentNode.loc.start,
                end: (bracketAfterTokens.at(-1) ?? constituentNode).loc.end,
              },
              fix: fixer =>
                [
                  beforeUnionOrIntersectionToken,
                  ...bracketBeforeTokens,
                  constituentNode,
                  ...bracketAfterTokens,
                  afterUnionOrIntersectionToken,
                ].flatMap(token => (token ? fixer.remove(token) : [])),
            });
          };
          const duplicatePrevious =
            uniqueConstituents.find(ele =>
              isSameAstNode(ele, constituentNode),
            ) ?? cachedTypeMap.get(constituentNodeType);
          if (duplicatePrevious) {
            report('duplicate', {
              type:
                node.type === AST_NODE_TYPES.TSIntersectionType
                  ? 'Intersection'
                  : 'Union',
              previous: sourceCode.getText(duplicatePrevious),
            });
            return uniqueConstituents;
          }
          forEachNodeType?.(constituentNodeType, report);
          cachedTypeMap.set(constituentNodeType, constituentNode);
          return [...uniqueConstituents, constituentNode];
        },
        [],
      );
    }

    return {
      ...(!ignoreIntersections && { TSIntersectionType: checkDuplicate }),
      ...(!ignoreUnions && {
        TSUnionType: (node): void =>
          checkDuplicate(node, (constituentNodeType, report) => {
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
                  maybeFunction.params.includes(maybeIdentifier) &&
                  isTypeFlagSet(constituentNodeType, ts.TypeFlags.Undefined)
                ) {
                  report('unnecessary');
                }
              }
            }
          }),
      }),
    };
  },
});
