import type { TSESTree } from '@typescript-eslint/utils';
import type { Type } from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isFunctionOrFunctionType,
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

type UnionOrIntersection = 'Intersection' | 'Union';

const astIgnoreKeys = new Set(['loc', 'parent', 'range']);

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
        actualNodeKey => !Object.hasOwn(expectedNode, actualNodeKey),
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
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreIntersections: {
            type: 'boolean',
            description: 'Whether to ignore `&` intersections.',
          },
          ignoreUnions: {
            type: 'boolean',
            description: 'Whether to ignore `|` unions.',
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

    function report(
      messageId: MessageIds,
      constituentNode: TSESTree.TypeNode,
      data?: Record<string, unknown>,
    ): void {
      const getUnionOrIntersectionToken = (
        where: 'After' | 'Before',
        at: number,
      ): TSESTree.Token | undefined =>
        sourceCode[`getTokens${where}`](constituentNode, {
          filter: token =>
            ['&', '|'].includes(token.value) &&
            constituentNode.parent.range[0] <= token.range[0] &&
            token.range[1] <= constituentNode.parent.range[1],
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
        bracketBeforeTokens = sourceCode.getTokensBefore(constituentNode, {
          count: bracketAfterTokens.length,
        });
      }
      context.report({
        loc: {
          start: constituentNode.loc.start,
          end: (bracketAfterTokens.at(-1) ?? constituentNode).loc.end,
        },
        node: constituentNode,
        messageId,
        data,
        fix: fixer =>
          [
            beforeUnionOrIntersectionToken,
            ...bracketBeforeTokens,
            constituentNode,
            ...bracketAfterTokens,
            afterUnionOrIntersectionToken,
          ].flatMap(token => (token ? fixer.remove(token) : [])),
      });
    }

    function checkDuplicateRecursively(
      unionOrIntersection: UnionOrIntersection,
      constituentNode: TSESTree.TypeNode,
      uniqueConstituents: TSESTree.TypeNode[],
      cachedTypeMap: Map<Type, TSESTree.TypeNode>,
      forEachNodeType?: (type: Type, node: TSESTree.TypeNode) => void,
    ): void {
      const type = parserServices.getTypeAtLocation(constituentNode);
      if (tsutils.isIntrinsicErrorType(type)) {
        return;
      }
      const duplicatedPrevious =
        uniqueConstituents.find(ele => isSameAstNode(ele, constituentNode)) ??
        cachedTypeMap.get(type);

      if (duplicatedPrevious) {
        report('duplicate', constituentNode, {
          type: unionOrIntersection,
          previous: sourceCode.getText(duplicatedPrevious),
        });
        return;
      }

      forEachNodeType?.(type, constituentNode);
      cachedTypeMap.set(type, constituentNode);
      uniqueConstituents.push(constituentNode);

      if (
        (unionOrIntersection === 'Union' &&
          constituentNode.type === AST_NODE_TYPES.TSUnionType) ||
        (unionOrIntersection === 'Intersection' &&
          constituentNode.type === AST_NODE_TYPES.TSIntersectionType)
      ) {
        for (const constituent of constituentNode.types) {
          checkDuplicateRecursively(
            unionOrIntersection,
            constituent,
            uniqueConstituents,
            cachedTypeMap,
            forEachNodeType,
          );
        }
      }
    }

    function checkDuplicate(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
      forEachNodeType?: (
        constituentNodeType: Type,
        constituentNode: TSESTree.TypeNode,
      ) => void,
    ): void {
      const cachedTypeMap = new Map<Type, TSESTree.TypeNode>();
      const uniqueConstituents: TSESTree.TypeNode[] = [];

      const unionOrIntersection =
        node.type === AST_NODE_TYPES.TSIntersectionType
          ? 'Intersection'
          : 'Union';

      for (const type of node.types) {
        checkDuplicateRecursively(
          unionOrIntersection,
          type,
          uniqueConstituents,
          cachedTypeMap,
          forEachNodeType,
        );
      }
    }

    return {
      ...(!ignoreIntersections && {
        TSIntersectionType(node) {
          if (node.parent.type === AST_NODE_TYPES.TSIntersectionType) {
            return;
          }
          checkDuplicate(node);
        },
      }),
      ...(!ignoreUnions && {
        TSUnionType: (node): void => {
          if (node.parent.type === AST_NODE_TYPES.TSUnionType) {
            return;
          }
          checkDuplicate(node, (constituentNodeType, constituentNode) => {
            const maybeTypeAnnotation = node.parent;
            if (maybeTypeAnnotation.type === AST_NODE_TYPES.TSTypeAnnotation) {
              const maybeIdentifier = maybeTypeAnnotation.parent;
              if (
                maybeIdentifier.type === AST_NODE_TYPES.Identifier &&
                maybeIdentifier.optional
              ) {
                const maybeFunction = maybeIdentifier.parent;
                if (
                  isFunctionOrFunctionType(maybeFunction) &&
                  maybeFunction.params.includes(maybeIdentifier) &&
                  tsutils.isTypeFlagSet(
                    constituentNodeType,
                    ts.TypeFlags.Undefined,
                  )
                ) {
                  report('unnecessary', constituentNode);
                }
              }
            }
          });
        },
      }),
    };
  },
});
