import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-confusing-non-null-assertion',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow non-null assertion in locations that may be confusing',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      confusingEqual:
        'Confusing combinations of non-null assertion and equal test like "a! == b", which looks very similar to not equal "a !== b"',
      confusingAssign:
        'Confusing combinations of non-null assertion and equal test like "a! = b", which looks very similar to not equal "a != b"',
      notNeedInEqualTest: 'Unnecessary non-null assertion (!) in equal test',
      notNeedInAssign: 'Unnecessary non-null assertion (!) in assignment left hand',
      wrapUpLeft:'Wrap up left hand to avoid putting non-null assertion "!" and "=" together',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      BinaryExpression(node: TSESTree.BinaryExpression): void {
        function isLeftHandPrimaryExpression(node:TSESTree.Expression)  {
          return node.type === AST_NODE_TYPES.MemberExpression ||
          node.type === AST_NODE_TYPES.Literal ||
          node.type === AST_NODE_TYPES.TemplateLiteral ||
          node.type === AST_NODE_TYPES.BigIntLiteral ||
          node.type === AST_NODE_TYPES.Identifier ||
          node.type === AST_NODE_TYPES.ObjectExpression ||
          node.type === AST_NODE_TYPES.ArrayExpression ||
          node.type === AST_NODE_TYPES.ThisExpression ||
          node.type === AST_NODE_TYPES.TSNullKeyword
        }

        if(node.operator === '==' || node.operator === '===' || node.operator === '='){
          const isAssign = node.operator === '=';
          const leftHandFinalToken = sourceCode.getLastToken(node.left);
          if(leftHandFinalToken?.type === AST_TOKEN_TYPES.Punctuator && leftHandFinalToken?.value === '!'){
            if(isLeftHandPrimaryExpression(node.left)){
              context.report({
                node,
                messageId: isAssign ? 'confusingAssign' : 'confusingEqual',
                suggest: [
                  {
                    messageId: 'notNeedInEqualTest',
                    fix: (fixer => [
                      fixer.remove(leftHandFinalToken),
                    ]),
                  },
                ],
              });
            }else{
              context.report({
                node,
                messageId: isAssign ? 'confusingAssign' : 'confusingEqual',
                suggest: [
                  {
                    messageId: 'wrapUpLeft',
                    fix: (fixer): TSESLint.RuleFix[] => [
                      fixer.insertTextBefore(node.left , '('),
                      fixer.insertTextAfter(node.left , ')'),
                    ],
                  },
                ],
              });
            }
          }
        }
      },
      TSNonNullExpression(node: TSESTree.TSNonNullExpression): void {
        function removeToken(): TSESLint.ReportFixFunction {
          return (fixer: TSESLint.RuleFixer): TSESLint.RuleFix | null => {
            const operator = sourceCode.getTokenAfter(
              node.expression,
              util.isNonNullAssertionPunctuator,
            );
            if (operator) {
              return fixer.remove(operator);
            }

            return null;
          };
        }

        const nextToken = sourceCode.getTokenAfter(node);

        if (
          nextToken &&
          nextToken.type === AST_TOKEN_TYPES.Punctuator &&
          (nextToken.value === '=')
        ) {
          if (
            node.parent &&
            (node.parent.type === AST_NODE_TYPES.AssignmentExpression)
          ) {
            // a! = b
            context.report({
              node,
              messageId: 'confusingAssign',
              suggest: [
                {
                  messageId: 'notNeedInEqualTest',
                  fix: removeToken(),
                },
              ],
            });
          } else {
            // others, like `a + b! = c`
            // find assignment left hand expression
            // for complicated left hand expressions, like `(obj = new new OuterObj().InnerObj).Name!`
            // `(a=b)!=c`
            let nowNode: TSESTree.Node | undefined = node;
            while (nowNode) {
              if (nowNode.type === AST_NODE_TYPES.AssignmentExpression) {
                if (nowNode.operator == nextToken.value && nowNode.operatorRange[0] == nextToken.range[0] && nowNode.operatorRange[1] == nextToken.range[1]) {
                  // ensure it's the exact operator
                  break;
                }
              }
              nowNode = nowNode.parent;
            }


            if(nowNode){
              const expression : TSESTree.AssignmentExpression = nowNode;
              context.report({
                node,
                messageId: 'confusingAssign',
                suggest: [
                  {
                    messageId: 'wrapUpLeft',
                    fix: (fixer): TSESLint.RuleFix[] => [
                      fixer.insertTextBefore(expression.left , '('),
                      fixer.insertTextAfter(expression.left , ')'),
                    ],
                  },
                ],
              });
            }else{
              context.report({
                node,
                messageId: 'confusingAssign',
              });
            }
          }
        }

        if (
          nextToken &&
          nextToken.type === AST_TOKEN_TYPES.Punctuator &&
          (nextToken.value === '==' || nextToken.value === '===')
        ) {
          if (
            node.parent &&
            node.parent.type === AST_NODE_TYPES.BinaryExpression &&
            (node.parent.operator === '===' || node.parent.operator === '==')
          ) {
            // a! == b
            context.report({
              node,
              messageId: 'confusingEqual',
              suggest: [
                {
                  messageId: 'notNeedInEqualTest',
                  fix: removeToken(),
                },
              ],
            });
          } else {
            // others, like `a + b! == c`
            // find assignment left hand expression
            // for complicated left hand expressions, like `(obj = new new OuterObj().InnerObj).Name!`
            // `(a==b)!==c`
            let nowNode: TSESTree.Node | undefined = node;
            while (nowNode) {
              if (nowNode.type === AST_NODE_TYPES.BinaryExpression) {
                if (nowNode.operator == nextToken.value && nowNode.operatorRange[0] == nextToken.range[0] && nowNode.operatorRange[1] == nextToken.range[1]) {
                  // ensure it's the exact operator
                  break;
                }
              }
              nowNode = nowNode.parent;
            }


            if(nowNode){
              const expression : TSESTree.BinaryExpression = nowNode;
              context.report({
                node,
                messageId: 'confusingEqual',
                suggest: [
                  {
                    messageId: 'wrapUpLeft',
                    fix: (fixer): TSESLint.RuleFix[] => [
                      fixer.insertTextBefore(expression.left , '('),
                      fixer.insertTextAfter(expression.left , ')'),
                    ],
                  },
                ],
              });
            }else{
              context.report({
                node,
                messageId: 'confusingEqual',
              });
            }
          }
        }
      },
    };
  },
});
