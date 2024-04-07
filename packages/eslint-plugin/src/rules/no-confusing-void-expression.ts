import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { MakeRequired } from '../util';
import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isClosingParenToken,
  isOpeningParenToken,
  isParenthesized,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import {
  ancestorHasReturnType,
  isValidFunctionExpressionReturnType,
} from '../util/explicitReturnTypeUtils';

export type Options = [
  {
    ignoreArrowShorthand?: boolean;
    ignoreVoidOperator?: boolean;
    ignoreVoidInVoid?: boolean;
  },
];

export type MessageId =
  | 'invalidVoidExpr'
  | 'invalidVoidExprArrow'
  | 'invalidVoidExprArrowWrapVoid'
  | 'invalidVoidExprReturn'
  | 'invalidVoidExprReturnLast'
  | 'invalidVoidExprReturnWrapVoid'
  | 'invalidVoidExprWrapVoid'
  | 'voidExprWrapVoid';

function findFunction(
  node: TSESTree.Node | undefined,
):
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | null {
  if (!node) {
    return null;
  }
  if (
    node.type === AST_NODE_TYPES.FunctionExpression ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    node.type === AST_NODE_TYPES.FunctionDeclaration
  ) {
    return node;
  }
  return findFunction(node.parent);
}

export default createRule<Options, MessageId>({
  name: 'no-confusing-void-expression',
  meta: {
    docs: {
      description:
        'Require expressions of type void to appear in statement position',
      recommended: 'strict',
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
        'Returning a void expression from a function is forbidden. ' +
        'Please move it before the `return` statement.',
      invalidVoidExprReturnLast:
        'Returning a void expression from a function is forbidden. ' +
        'Please remove the `return` statement.',
      invalidVoidExprReturnWrapVoid:
        'Void expressions returned from a function ' +
        'must be marked explicitly with the `void` operator.',
      voidExprWrapVoid: 'Mark with an explicit `void` operator.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreArrowShorthand: { type: 'boolean' },
          ignoreVoidOperator: { type: 'boolean' },
          ignoreVoidInVoid: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
    fixable: 'code',
    hasSuggestions: true,
  },
  defaultOptions: [
    {
      ignoreArrowShorthand: false,
      ignoreVoidOperator: false,
      ignoreVoidInVoid: false,
    },
  ],
  create(context, [options]) {
    return {
      'AwaitExpression, CallExpression, TaggedTemplateExpression'(
        node:
          | TSESTree.AwaitExpression
          | TSESTree.CallExpression
          | TSESTree.TaggedTemplateExpression,
      ): void {
        const services = getParserServices(context);
        const type = getConstrainedTypeAtLocation(services, node);
        if (!tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike)) {
          // not a void expression
          return;
        }

        const invalidAncestor = findInvalidAncestor(node);

        if (invalidAncestor == null) {
          // void expression is in valid position
          return;
        }

        const wrapVoidFix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
          const nodeText = context.sourceCode.getText(node);
          const newNodeText = `void ${nodeText}`;
          return fixer.replaceText(node, newNodeText);
        };

        if (invalidAncestor.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          // handle arrow function shorthand

          if (options.ignoreVoidInVoid) {
            if (hasValidReturnType(invalidAncestor)) {
              return;
            }
          }

          if (options.ignoreVoidOperator) {
            // handle wrapping with `void`
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
              if (!canFix(arrowFunction)) {
                return null;
              }
              const arrowBody = arrowFunction.body;
              const arrowBodyText = context.sourceCode.getText(arrowBody);
              const newArrowBodyText = `{ ${arrowBodyText}; }`;
              if (isParenthesized(arrowBody, context.sourceCode)) {
                const bodyOpeningParen = nullThrows(
                  context.sourceCode.getTokenBefore(
                    arrowBody,
                    isOpeningParenToken,
                  ),
                  NullThrowsReasons.MissingToken(
                    'opening parenthesis',
                    'arrow body',
                  ),
                );
                const bodyClosingParen = nullThrows(
                  context.sourceCode.getTokenAfter(
                    arrowBody,
                    isClosingParenToken,
                  ),
                  NullThrowsReasons.MissingToken(
                    'closing parenthesis',
                    'arrow body',
                  ),
                );
                return fixer.replaceTextRange(
                  [bodyOpeningParen.range[0], bodyClosingParen.range[1]],
                  newArrowBodyText,
                );
              }
              return fixer.replaceText(arrowBody, newArrowBodyText);
            },
          });
        }

        if (invalidAncestor.type === AST_NODE_TYPES.ReturnStatement) {
          // handle return statement

          if (options.ignoreVoidInVoid) {
            const functionNode = findFunction(invalidAncestor);

            if (hasValidReturnType(functionNode)) {
              return;
            }
          }

          if (options.ignoreVoidOperator) {
            // handle wrapping with `void`
            return context.report({
              node,
              messageId: 'invalidVoidExprReturnWrapVoid',
              fix: wrapVoidFix,
            });
          }

          if (isFinalReturn(invalidAncestor)) {
            // remove the `return` keyword
            return context.report({
              node,
              messageId: 'invalidVoidExprReturnLast',
              fix(fixer) {
                if (!canFix(invalidAncestor)) {
                  return null;
                }
                const returnValue = invalidAncestor.argument;
                const returnValueText = context.sourceCode.getText(returnValue);
                let newReturnStmtText = `${returnValueText};`;
                if (isPreventingASI(returnValue)) {
                  // put a semicolon at the beginning of the line
                  newReturnStmtText = `;${newReturnStmtText}`;
                }
                return fixer.replaceText(invalidAncestor, newReturnStmtText);
              },
            });
          }

          // move before the `return` keyword
          return context.report({
            node,
            messageId: 'invalidVoidExprReturn',
            fix(fixer) {
              const returnValue = invalidAncestor.argument;
              const returnValueText = context.sourceCode.getText(returnValue);
              let newReturnStmtText = `${returnValueText}; return;`;
              if (isPreventingASI(returnValue)) {
                // put a semicolon at the beginning of the line
                newReturnStmtText = `;${newReturnStmtText}`;
              }
              if (
                invalidAncestor.parent.type !== AST_NODE_TYPES.BlockStatement
              ) {
                // e.g. `if (cond) return console.error();`
                // add braces if not inside a block
                newReturnStmtText = `{ ${newReturnStmtText} }`;
              }
              return fixer.replaceText(invalidAncestor, newReturnStmtText);
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

    type ReturnStatementWithArgument = MakeRequired<
      TSESTree.ReturnStatement,
      'argument'
    >;

    type InvalidAncestor =
      | Exclude<TSESTree.Node, TSESTree.ReturnStatement>
      | ReturnStatementWithArgument;

    /**
     * Inspects the void expression's ancestors and finds closest invalid one.
     * By default anything other than an ExpressionStatement is invalid.
     * Parent expressions which can be used for their short-circuiting behavior
     * are ignored and their parents are checked instead.
     * @param node The void expression node to check.
     * @returns Invalid ancestor node if it was found. `null` otherwise.
     */
    function findInvalidAncestor(node: TSESTree.Node): InvalidAncestor | null {
      const parent = nullThrows(node.parent, NullThrowsReasons.MissingParent);
      if (parent.type === AST_NODE_TYPES.SequenceExpression) {
        if (node !== parent.expressions[parent.expressions.length - 1]) {
          return null;
        }
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

      if (parent.type === AST_NODE_TYPES.ChainExpression) {
        // e.g. `console?.log('foo')`
        return findInvalidAncestor(parent);
      }

      // Any other parent is invalid.
      // We can assume a return statement will have an argument.
      return parent as InvalidAncestor;
    }

    /** Checks whether the return statement is the last statement in a function body. */
    function isFinalReturn(node: TSESTree.ReturnStatement): boolean {
      // the parent must be a block
      const block = nullThrows(node.parent, NullThrowsReasons.MissingParent);
      if (block.type !== AST_NODE_TYPES.BlockStatement) {
        // e.g. `if (cond) return;` (not in a block)
        return false;
      }

      // the block's parent must be a function
      const blockParent = nullThrows(
        block.parent,
        NullThrowsReasons.MissingParent,
      );
      if (
        ![
          AST_NODE_TYPES.FunctionDeclaration,
          AST_NODE_TYPES.FunctionExpression,
          AST_NODE_TYPES.ArrowFunctionExpression,
        ].includes(blockParent.type)
      ) {
        // e.g. `if (cond) { return; }`
        // not in a top-level function block
        return false;
      }

      // must be the last child of the block
      if (block.body.indexOf(node) < block.body.length - 1) {
        // not the last statement in the block
        return false;
      }

      return true;
    }

    /**
     * Checks whether the given node, if placed on its own line,
     * would prevent automatic semicolon insertion on the line before.
     *
     * This happens if the line begins with `(`, `[` or `` ` ``
     */
    function isPreventingASI(node: TSESTree.Expression): boolean {
      const startToken = nullThrows(
        context.sourceCode.getFirstToken(node),
        NullThrowsReasons.MissingToken('first token', node.type),
      );

      return ['(', '[', '`'].includes(startToken.value);
    }

    function canFix(
      node: ReturnStatementWithArgument | TSESTree.ArrowFunctionExpression,
    ): boolean {
      const services = getParserServices(context);

      const targetNode =
        node.type === AST_NODE_TYPES.ReturnStatement
          ? node.argument
          : node.body;

      const type = getConstrainedTypeAtLocation(services, targetNode);
      return tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike);
    }

    function hasValidReturnType(
      node:
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | null,
    ): boolean {
      if (node != null) {
        if (
          (node.returnType &&
            node.returnType.typeAnnotation.type !==
              AST_NODE_TYPES.TSAnyKeyword &&
            node.returnType.typeAnnotation.type !==
              AST_NODE_TYPES.TSUnknownKeyword) ||
          ((node.type === AST_NODE_TYPES.FunctionExpression ||
            node.type === AST_NODE_TYPES.ArrowFunctionExpression) &&
            isValidFunctionExpressionReturnType(node, {
              allowTypedFunctionExpressions: true,
            })) ||
          ancestorHasReturnType(node)
        ) {
          return true;
        }
      }

      return false;
    }
  },
});
