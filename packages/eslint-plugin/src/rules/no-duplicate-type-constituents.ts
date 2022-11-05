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

export default util.createRule<Options, MessageIds>({
  name: 'no-duplicate-type-constituents',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow duplicate union/intersection type members',
      recommended: false,
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

      node.types.forEach(memberNode => {
        const type = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(memberNode),
        );
        if (uniqConstituentTypes.has(type)) {
          duplicateConstituentNodes.push(memberNode);
        } else {
          uniqConstituentTypes.add(type);
        }
      });

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
