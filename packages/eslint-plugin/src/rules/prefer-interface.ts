import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'prefer-interface',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer an interface declaration over a type literal (type T = { ... })',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      interfaceOverType: 'Use an interface instead of a type literal.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      // VariableDeclaration with kind type has only one VariableDeclarator
      "TSTypeAliasDeclaration[typeAnnotation.type='TSTypeLiteral']"(
        node: TSESTree.TSTypeAliasDeclaration,
      ) {
        context.report({
          node: node.id,
          messageId: 'interfaceOverType',
          fix(fixer) {
            const typeNode = node.typeParameters || node.id;
            const fixes: TSESLint.RuleFix[] = [];

            const firstToken = sourceCode.getFirstToken(node);
            if (firstToken) {
              fixes.push(fixer.replaceText(firstToken, 'interface'));
              fixes.push(
                fixer.replaceTextRange(
                  [typeNode.range[1], node.typeAnnotation.range[0]],
                  ' ',
                ),
              );
            }

            const afterToken = sourceCode.getTokenAfter(node.typeAnnotation);
            if (
              afterToken &&
              afterToken.type === 'Punctuator' &&
              afterToken.value === ';'
            ) {
              fixes.push(fixer.remove(afterToken));
            }

            return fixes;
          },
        });
      },
    };
  },
});
