import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { MakeRequired } from '../util';

import {
  addBracesToArrowFix,
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isFinalReturn,
  moveValueBeforeReturnFix,
  nullThrows,
  NullThrowsReasons,
  removeReturnLeaveValueFix,
} from '../util';
import { getParentFunctionNode } from '../util/getParentFunctionNode';

export type Options = [
  {
    ignoreArrowShorthand?: boolean;
    ignoreVoidOperator?: boolean;
    ignoreVoidReturningFunctions?: boolean;
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

export default createRule<Options, MessageId>({
  name: 'no-confusing-void-expression',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require expressions of type void to appear in statement position',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      invalidVoidExpr:
        'Placing a void expression inside another expression is forbidden. ' +
        'Move it to its own statement instead.',
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
      invalidVoidExprWrapVoid:
        'Void expressions used inside another expression ' +
        'must be moved to its own statement ' +
        'or marked explicitly with the `void` operator.',
      voidExprWrapVoid: 'Mark with an explicit `void` operator.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreArrowShorthand: {
            type: 'boolean',
            description:
              'Whether to ignore "shorthand" `() =>` arrow functions: those without `{ ... }` braces.',
          },
          ignoreVoidOperator: {
            type: 'boolean',
            description:
              'Whether to ignore returns that start with the `void` operator.',
          },
          ignoreVoidReturningFunctions: {
            type: 'boolean',
            description:
              'Whether to ignore returns from functions with explicit `void` return types and functions with contextual `void` return types.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      ignoreArrowShorthand: false,
      ignoreVoidOperator: false,
      ignoreVoidReturningFunctions: false,
    },
  ],

  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      'AwaitExpression, CallExpression, TaggedTemplateExpression'(
        node:
          | TSESTree.AwaitExpression
          | TSESTree.CallExpression
          | TSESTree.TaggedTemplateExpression,
      ): void {
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

          if (options.ignoreVoidReturningFunctions) {
            const returnsVoid = isVoidReturningFunctionNode(invalidAncestor);

            if (returnsVoid) {
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
          return context.report({
            node,
            messageId: 'invalidVoidExprArrow',
            fix(fixer) {
              if (!canFix(invalidAncestor)) {
                return null;
              }
              return addBracesToArrowFix(
                fixer,
                context.sourceCode,
                invalidAncestor,
              );
            },
          });
        }

        if (invalidAncestor.type === AST_NODE_TYPES.ReturnStatement) {
          // handle return statement

          if (options.ignoreVoidReturningFunctions) {
            const functionNode = getParentFunctionNode(invalidAncestor);

            if (functionNode) {
              const returnsVoid = isVoidReturningFunctionNode(functionNode);

              if (returnsVoid) {
                return;
              }
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
                return removeReturnLeaveValueFix(
                  fixer,
                  context.sourceCode,
                  invalidAncestor,
                );
              },
            });
          }

          // move before the `return` keyword
          return context.report({
            node,
            messageId: 'invalidVoidExprReturn',
            fix(fixer) {
              return moveValueBeforeReturnFix(
                fixer,
                context.sourceCode,
                invalidAncestor,
              );
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
      if (
        parent.type === AST_NODE_TYPES.SequenceExpression &&
        node !== parent.expressions[parent.expressions.length - 1]
      ) {
        return null;
      }

      if (parent.type === AST_NODE_TYPES.ExpressionStatement) {
        // e.g. `{ console.log("foo"); }`
        // this is always valid
        return null;
      }

      if (
        parent.type === AST_NODE_TYPES.LogicalExpression &&
        parent.right === node
      ) {
        // e.g. `x && console.log(x)`
        // this is valid only if the next ancestor is valid
        return findInvalidAncestor(parent);
      }

      if (
        parent.type === AST_NODE_TYPES.ConditionalExpression &&
        (parent.consequent === node || parent.alternate === node)
      ) {
        // e.g. `cond ? console.log(true) : console.log(false)`
        // this is valid only if the next ancestor is valid
        return findInvalidAncestor(parent);
      }

      if (
        parent.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        // e.g. `() => console.log("foo")`
        // this is valid with an appropriate option
        options.ignoreArrowShorthand
      ) {
        return null;
      }

      if (
        parent.type === AST_NODE_TYPES.UnaryExpression &&
        parent.operator === 'void' &&
        // e.g. `void console.log("foo")`
        // this is valid with an appropriate option
        options.ignoreVoidOperator
      ) {
        return null;
      }

      if (parent.type === AST_NODE_TYPES.ChainExpression) {
        // e.g. `console?.log('foo')`
        return findInvalidAncestor(parent);
      }

      // Any other parent is invalid.
      // We can assume a return statement will have an argument.
      return parent as InvalidAncestor;
    }

    function canFix(
      node: ReturnStatementWithArgument | TSESTree.ArrowFunctionExpression,
    ): boolean {
      const targetNode =
        node.type === AST_NODE_TYPES.ReturnStatement
          ? node.argument
          : node.body;

      const type = getConstrainedTypeAtLocation(services, targetNode);
      return tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike);
    }

    function isFunctionReturnTypeIncludesVoid(functionType: ts.Type): boolean {
      const callSignatures = tsutils.getCallSignaturesOfType(functionType);

      return callSignatures.some(signature => {
        const returnType = signature.getReturnType();

        return tsutils
          .unionTypeParts(returnType)
          .some(tsutils.isIntrinsicVoidType);
      });
    }

    function isVoidReturningFunctionNode(
      functionNode:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): boolean {
      // Game plan:
      //   - If the function node has a type annotation, check if it includes `void`.
      //     - If it does then the function is safe to return `void` expressions in.
      //   - Otherwise, check if the function is a function-expression or an arrow-function.
      //   -   If it is, get its contextual type and bail if we cannot.
      //   - Return based on whether the contextual type includes `void` or not

      const functionTSNode = services.esTreeNodeToTSNodeMap.get(functionNode);

      if (functionTSNode.type) {
        const returnType = checker.getTypeFromTypeNode(functionTSNode.type);

        return tsutils
          .unionTypeParts(returnType)
          .some(tsutils.isIntrinsicVoidType);
      }

      if (ts.isExpression(functionTSNode)) {
        const functionType = checker.getContextualType(functionTSNode);

        if (functionType) {
          return tsutils
            .unionTypeParts(functionType)
            .some(isFunctionReturnTypeIncludesVoid);
        }
      }

      return false;
    }
  },
});
