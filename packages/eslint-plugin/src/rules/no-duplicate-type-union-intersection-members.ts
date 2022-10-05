import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

export type Options = [
  {
    ignoreIntersections?: boolean;
    ignoreUnions?: boolean;
  },
];
export type MessageIds = 'duplicate' | 'suggestFix';

export default util.createRule<Options, MessageIds>({
  name: 'no-duplicate-type-union-intersection-members',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow duplicate union/intersection type members',
      recommended: false,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      duplicate: '{{type}} type member {{name}} is duplicated.',
      suggestFix: 'Delete duplicated members of type (removes all comments).',
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
      const duplicateMemberTexts: string[] = [];
      const uniqueMemberTexts = new Set<string>();

      const source = node.types.map(type => {
        return {
          node: type,
          text: sourceCode.getText(type),
        };
      });

      const hasComments = node.types.some(type => {
        const count =
          sourceCode.getCommentsBefore(type).length +
          sourceCode.getCommentsAfter(type).length;
        return count > 0;
      });

      const fix: TSESLint.ReportFixFunction = fixer => {
        const result = [...uniqueMemberTexts].join(
          node.type === AST_NODE_TYPES.TSIntersectionType ? ' & ' : ' | ',
        );
        return fixer.replaceText(node, result);
      };

      source.forEach(({ text }) => {
        if (uniqueMemberTexts.has(text)) {
          duplicateMemberTexts.push(text);
        }
        uniqueMemberTexts.add(text);
      });

      duplicateMemberTexts.forEach(duplicateMemberName => {
        context.report({
          data: {
            name: duplicateMemberName,
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
            : { fix }),
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
