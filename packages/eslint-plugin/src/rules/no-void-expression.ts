import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';
import {
  isClosingParenToken,
  isOpeningParenToken,
  isParenthesized,
} from '../util';

export type Options = [
  {
    ignoreArrowShorthand?: boolean;
    ignoreVoidOperator?: boolean;
  },
];

export type MessageId =
  | 'invalidVoidExpr'
  | 'invalidVoidExprWrapVoid'
  | 'invalidVoidExprArrow'
  | 'invalidVoidExprArrowWrapVoid'
  | 'invalidVoidExprReturn'
  | 'invalidVoidExprReturnLast'
  | 'invalidVoidExprReturnWrapVoid'
  | 'voidExprWrapVoid';

export default util.createRule<Options, MessageId>({
  name: 'no-void-expression',
  meta: {
    docs: {
      description:
        'Requires expressions of type void to appear in statement position',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      invalidVoidExpr:
        'Placing a void expression inside another expression is forbidden. ' +
        'Move it to its own statement instead.',
      invalidVoidExprWrapVoid:
        'Void expressions used inside another expression ' +
        'must be moved to its own statement ' +
        'or marked explicitly with the `void` operator.',
      invalidVoidExprArrow:
        'Returning a void expression from an arrow function shorthand is forbidden. ' +
        'Please add braces to the arrow function.',
      invalidVoidExprArrowWrapVoid:
        'Void expressions returned from an arrow function shorthand ' +
        'must be marked explicitly with the `void` operator.',
      invalidVoidExprReturn:
        'Returning a void expression from a function is forbidden.' +
        'Please move it before the `return` statement.',
      invalidVoidExprReturnLast:
        'Returning a void expression from a function is forbidden.' +
        'Please remove the `return` statement.',
      invalidVoidExprReturnWrapVoid:
        'Void expressions returned from a function ' +
        'must be marked explicitly with the `void` operator.',
      voidExprWrapVoid: 'Mark with an explicit `void` operator',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreArrowShorthand: { type: 'boolean' },
          ignoreVoidOperator: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [{}],

  create(context, [options]) {
    return {
      'AwaitExpression, CallExpression, TaggedTemplateExpression'(
        node:
          | TSESTree.AwaitExpression
          | TSESTree.CallExpression
          | TSESTree.TaggedTemplateExpression,
      ): void {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = util.getConstrainedTypeAtLocation(checker, tsNode);
        if (!tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike)) {
          // not a void expression
          return;
        }

        const invalidAncestor = findInvalidAncestor(node);
        if (invalidAncestor == null) {
          // void expression is in valid position
          return;
        }

        const sourceCode = context.getSourceCode();
        const wrapVoidFix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
          const nodeText = sourceCode.getText(node);
          const newNodeText = `void ${nodeText}`;
          return fixer.replaceText(node, newNodeText);
        };

        // handle arrow function shorthand
        if (invalidAncestor.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          // handle wrapping with `void`
          if (options.ignoreVoidOperator) {
            return context.report({
              node,
              messageId: 'invalidVoidExprArrowWrapVoid',
              fix: wrapVoidFix,
            });
          }

          // handle wrapping with braces
          const arrowFunction = invalidAncestor;
          return context.report({
            node,
            messageId: 'invalidVoidExprArrow',
            fix(fixer) {
              const arrowBody = arrowFunction.body;
              const arrowBodyText = sourceCode.getText(arrowBody);
              const newArrowBodyText = `{ ${arrowBodyText}; }`;
              if (isParenthesized(arrowBody, sourceCode)) {
                const [bodyOpeningParen, bodyClosingParen] = [
                  sourceCode.getTokenBefore(arrowBody, isOpeningParenToken)!,
                  sourceCode.getTokenAfter(arrowBody, isClosingParenToken)!,
                ];
                return fixer.replaceTextRange(
                  [bodyOpeningParen.range[0], bodyClosingParen.range[1]],
                  newArrowBodyText,
                );
              }
              return fixer.replaceText(arrowBody, newArrowBodyText);
            },
          });
        }

        // handle return statement
        if (invalidAncestor.type === AST_NODE_TYPES.ReturnStatement) {
          // handle wrapping with `void`
          if (options.ignoreVoidOperator) {
            return context.report({
              node,
              messageId: 'invalidVoidExprReturnWrapVoid',
              fix: wrapVoidFix,
            });
          }

          // handle moving to it's own statement
          const returnStmt = invalidAncestor;
          let isTopLevelReturn = false;
          let isLastReturn = false;
          if (returnStmt.parent?.type === AST_NODE_TYPES.BlockStatement) {
            const block = returnStmt.parent;
            const blockType = block.parent?.type;
            if (
              blockType === AST_NODE_TYPES.FunctionDeclaration ||
              blockType === AST_NODE_TYPES.FunctionExpression ||
              blockType === AST_NODE_TYPES.ArrowFunctionExpression
            ) {
              isTopLevelReturn = true;
            }
            if (block.body.indexOf(returnStmt) === block.body.length - 1) {
              isLastReturn = true;
            }
          }

          // remove the `return` keyword
          if (isTopLevelReturn && isLastReturn) {
            return context.report({
              node,
              messageId: 'invalidVoidExprReturnLast',
              fix(fixer) {
                const returnValue = returnStmt.argument!;
                const returnValueText = sourceCode.getText(returnValue);
                const newReturnStmtText = `${returnValueText};`;
                return fixer.replaceText(returnStmt, newReturnStmtText);
              },
            });
          }

          // move before the `return` keyword
          return context.report({
            node,
            messageId: 'invalidVoidExprReturn',
            fix(fixer) {
              const returnValue = returnStmt.argument!;
              const returnValueText = sourceCode.getText(returnValue);
              let newReturnStmtText = `${returnValueText}; return;`;
              if (returnStmt.parent?.type !== AST_NODE_TYPES.BlockStatement) {
                // e.g. `if (cond) return console.error();`
                // add braces if not inside a block
                newReturnStmtText = `{ ${newReturnStmtText} }`;
              }
              return fixer.replaceText(returnStmt, newReturnStmtText);
            },
          });
        }

        // handle generic case
        if (options.ignoreVoidOperator) {
          // this would be reported by this rule btw. such irony
          return context.report({
            node,
            messageId: 'invalidVoidExprWrapVoid',
            suggest: [{ messageId: 'voidExprWrapVoid', fix: wrapVoidFix }],
          });
        }
        context.report({
          node,
          messageId: 'invalidVoidExpr',
        });
      },
    };

    /**
     * Inspects the void expression's ancestors and finds closest invalid one.
     * By default anything other than an ExpressionStatement is invalid.
     * Parent expressions which can be used for their short-circuiting behavior
     * are ignored and their parents are checked instead.
     * @param node The void expression node to check.
     * @returns Invalid ancestor node if it was found. `null` otherwise.
     */
    function findInvalidAncestor(node: TSESTree.Node): TSESTree.Node | null {
      const { parent } = node;

      if (parent == null) {
        // if there is no parent then let's say it's valid
        return null;
      }

      if (parent.type === AST_NODE_TYPES.ExpressionStatement) {
        // e.g. `{ console.log("foo"); }`
        // this is always valid
        return null;
      }

      if (parent.type === AST_NODE_TYPES.LogicalExpression) {
        if (parent.right === node) {
          // e.g. `x && console.log(x)`
          // this is valid only if the next ancestor is valid
          return findInvalidAncestor(parent);
        }
      }

      if (parent.type === AST_NODE_TYPES.ConditionalExpression) {
        if (parent.consequent === node || parent.alternate === node) {
          // e.g. `cond ? console.log(true) : console.log(false)`
          // this is valid only if the next ancestor is valid
          return findInvalidAncestor(parent);
        }
      }

      if (parent.type === AST_NODE_TYPES.ArrowFunctionExpression) {
        // e.g. `() => console.log("foo")`
        // this is valid with an appropriate option
        if (options.ignoreArrowShorthand) {
          return null;
        }
      }

      if (parent.type === AST_NODE_TYPES.UnaryExpression) {
        if (parent.operator === 'void') {
          // e.g. `void console.log("foo")`
          // this is valid with an appropriate option
          if (options.ignoreVoidOperator) {
            return null;
          }
        }
      }

      // any other parent is invalid
      return parent;
    }
  },
});
