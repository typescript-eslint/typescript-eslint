import {
  AST_TOKEN_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'consistent-type-definitions',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Consistent with type definition either `interface` or `type`',
      category: 'Stylistic Issues',
      // too opinionated to be recommended
      recommended: false,
    },
    messages: {
      interfaceOverType: 'Use an `interface` instead of a `type`.',
      typeOverInterface: 'Use a `type` instead of an `interface`.',
    },
    schema: [
      {
        enum: ['interface', 'type'],
      },
    ],
    fixable: 'code',
  },
  defaultOptions: ['interface'],
  create(context, [option]) {
    const sourceCode = context.getSourceCode();

    return {
      "TSTypeAliasDeclaration[typeAnnotation.type='TSTypeLiteral']"(
        node: TSESTree.TSTypeAliasDeclaration,
      ): void {
        if (option === 'interface') {
          context.report({
            node: node.id,
            messageId: 'interfaceOverType',
            fix(fixer) {
              const typeNode = node.typeParameters ?? node.id;
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
                afterToken.type === AST_TOKEN_TYPES.Punctuator &&
                afterToken.value === ';'
              ) {
                fixes.push(fixer.remove(afterToken));
              }

              return fixes;
            },
          });
        }
      },
      TSInterfaceDeclaration(node): void {
        if (option === 'type') {
          context.report({
            node: node.id,
            messageId: 'typeOverInterface',
            fix(fixer) {
              const typeNode = node.typeParameters ?? node.id;
              const fixes: TSESLint.RuleFix[] = [];

              const firstToken = sourceCode.getFirstToken(node);
              if (firstToken) {
                fixes.push(fixer.replaceText(firstToken, 'type'));
                fixes.push(
                  fixer.replaceTextRange(
                    [typeNode.range[1], node.body.range[0]],
                    ' = ',
                  ),
                );
              }

              if (node.extends) {
                node.extends.forEach(heritage => {
                  const typeIdentifier = sourceCode.getText(heritage);
                  fixes.push(
                    fixer.insertTextAfter(node.body, ` & ${typeIdentifier}`),
                  );
                });
              }

              return fixes;
            },
          });
        }
      },
    };
  },
});
