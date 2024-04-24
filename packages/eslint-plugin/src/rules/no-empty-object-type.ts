import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'no-empty-object-type',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow accidentally using the "empty object" type',
      recommended: 'recommended',
    },
    hasSuggestions: true,
    messages: {
      banEmptyObjectType: [
        'The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`.',
        "- If that's what you want, disable this lint rule with an inline comment or in your ESLint config.",
        '- If you want a type meaning "any object", you probably want `object` instead.',
        '- If you want a type meaning "any value", you probably want `unknown` instead.',
        '- If you want a type meaning "empty object", you probably want `Record<string, never>` instead.',
      ].join('\n'),
      replaceEmptyObjectType: 'Replace `{}` with `{{replacement}}`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSTypeLiteral(node): void {
        if (
          node.members.length ||
          node.parent.type === AST_NODE_TYPES.TSIntersectionType
        ) {
          return;
        }

        context.report({
          messageId: 'banEmptyObjectType',
          node,
          suggest: ['object', 'unknown', 'Record<string, never>'].map(
            replacement => ({
              data: { replacement },
              messageId: 'replaceEmptyObjectType',
              fix: (fixer): TSESLint.RuleFix =>
                fixer.replaceText(node, replacement),
            }),
          ),
        });
      },
    };
  },
});
