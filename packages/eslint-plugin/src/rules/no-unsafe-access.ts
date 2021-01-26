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
      suggestion: true,
      recommended: false,
    },
    messages: {
      noSafeAccess:
        'Member access is not secure, use optional chain substitution',
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
          _token: TSESTree.Node | TSESTree.Token,
          replacement: '?.' | '?.[',
        ): TSESLint.ReportFixFunction {
          return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null => {
            if (_token && !node.optional) {
              return fixer.replaceText(_token, replacement);
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
