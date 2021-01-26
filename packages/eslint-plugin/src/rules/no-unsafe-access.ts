import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'noSafeAccess';

export default util.createRule<[], MessageIds>({
  name: 'no-unsafe-access',
  meta: {
    type: 'problem',
    docs: {
      description:
        'OptionalChain is recommended when accessing non-built-in object members',
      category: 'Stylistic Issues',
      recommended: 'error',
      suggestion: true,
    },
    messages: {
      noSafeAccess:
        'Members are not securely accessible and are recommended OptionalChain',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (util.getStaticValue(node, context.getScope()) != null) {
          return;
        }
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];
        const token = sourceCode.getTokenBefore(node.property);
        function convertTokenToOptional(
          token: TSESTree.Node | TSESTree.Token,
          replacement: '?.' | '?.[',
        ): TSESLint.ReportFixFunction {
          return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null => {
            if (token && !node.optional) {
              return fixer.replaceText(token, replacement);
            }
            return null;
          };
        }

        if (token && !node.optional) {
          suggest.push({
            messageId: 'noSafeAccess',
            fix: convertTokenToOptional(token, node.computed ? '?.[' : '?.'),
          });
          context.report({ node, messageId: 'noSafeAccess', suggest });
        }
      },
    };
  },
});
