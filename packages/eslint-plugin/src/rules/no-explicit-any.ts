import * as util from '../util';
import { TSESLint } from '@typescript-eslint/experimental-utils';

type Options = [
  {
    fixToUnknown: boolean;
  }
];
type MessageIds = 'unexpectedAny';

export default util.createRule<Options, MessageIds>({
  name: 'no-explicit-any',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of the `any` type',
      category: 'Best Practices',
      recommended: 'warn',
    },
    fixable: 'code',
    messages: {
      unexpectedAny: 'Unexpected any. Specify a different type.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          fixToUnknown: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      fixToUnknown: false,
    },
  ],

  create(context, [option]) {
    return {
      TSAnyKeyword(node) {
        let fix: TSESLint.ReportFixFunction | null = null;

        if (option.fixToUnknown) {
          fix = fixer => fixer.replaceText(node, 'unknown');
        }

        context.report({
          node,
          messageId: 'unexpectedAny',
          fix,
        });
      },
    };
  },
});
