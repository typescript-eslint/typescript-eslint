import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

const WHITESPACE_REGEX = /\s/g;

/*
The AST is always constructed such the first element is always the deepest element.

I.e. for this code: `foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz`
The AST will look like this:
{
  left: {
    left: {
      left: foo
      right: foo.bar
    }
    right: foo.bar.baz
  }
  right: foo.bar.baz.buzz
}
*/
export default util.createRule({
  name: 'prefer-optional-chain',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer using concise optional chain expressions instead of chained logical ands',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferOptionalChain:
        "Prefer using an optional chain expression instead, as it's more concise and easier to read.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      [[
        'LogicalExpression[operator="&&"] > Identifier',
        'LogicalExpression[operator="&&"] > BinaryExpression[operator="!=="]',
        'LogicalExpression[operator="&&"] > BinaryExpression[operator="!="]',
      ].join(',')](
        initialIdentifierOrNotEqualsExpr:
          | TSESTree.BinaryExpression
          | TSESTree.Identifier,
      ): void {
        // selector guarantees this cast
        const initialExpression = initialIdentifierOrNotEqualsExpr.parent as TSESTree.LogicalExpression;

        if (initialExpression.left !== initialIdentifierOrNotEqualsExpr) {
          // the identifier is not the deepest left node
          return;
        }
        if (!isValidChainTarget(initialIdentifierOrNotEqualsExpr, true)) {
          return;
        }

        // walk up the tree to figure out how many logical expressions we can include
        let previous: TSESTree.LogicalExpression = initialExpression;
        let current: TSESTree.Node = initialExpression;
        let previousLeftText = getText(initialIdentifierOrNotEqualsExpr);
        let optionallyChainedCode = previousLeftText;
        let expressionCount = 1;
        while (current.type === AST_NODE_TYPES.LogicalExpression) {
          if (!isValidChainTarget(current.right)) {
            break;
          }

          const leftText = previousLeftText;
          const rightText = getText(current.right);
          if (!rightText.startsWith(leftText)) {
            break;
          }
          expressionCount += 1;

          // omit weird doubled up expression that make no sense like foo.bar && foo.bar
          if (rightText !== leftText) {
            previousLeftText = rightText;

            /*
            Diff the left and right text to construct the fix string
            There are the following cases:

            1)
            rightText === 'foo.bar.baz.buzz'
            leftText === 'foo.bar.baz'
            diff === '.buzz'

            2)
            rightText === 'foo.bar.baz.buzz()'
            leftText === 'foo.bar.baz'
            diff === '.buzz()'

            3)
            rightText === 'foo.bar.baz.buzz()'
            leftText === 'foo.bar.baz.buzz'
            diff === '()'

            4)
            rightText === 'foo.bar.baz[buzz]'
            leftText === 'foo.bar.baz'
            diff === '[buzz]'
            */
            const diff = rightText.replace(leftText, '');
            const needsDot = diff.startsWith('(') || diff.startsWith('[');
            optionallyChainedCode += `?${needsDot ? '.' : ''}${diff}`;
          }

          /* istanbul ignore if: this shouldn't ever happen, but types */
          if (!current.parent) {
            break;
          }
          previous = current;
          current = current.parent;
        }

        if (expressionCount > 1) {
          context.report({
            node: previous,
            messageId: 'preferOptionalChain',
            fix(fixer) {
              return fixer.replaceText(previous, optionallyChainedCode);
            },
          });
        }
      },
    };

    function getText(
      node:
        | TSESTree.BinaryExpression
        | TSESTree.CallExpression
        | TSESTree.Identifier
        | TSESTree.MemberExpression,
    ): string {
      const text = sourceCode.getText(
        node.type === AST_NODE_TYPES.BinaryExpression ? node.left : node,
      );

      // Removes spaces from the source code for the given node
      return text.replace(WHITESPACE_REGEX, '');
    }
  },
});

function isValidChainTarget(
  node: TSESTree.Node,
  allowIdentifier = false,
): node is
  | TSESTree.BinaryExpression
  | TSESTree.CallExpression
  | TSESTree.MemberExpression {
  if (
    node.type === AST_NODE_TYPES.MemberExpression ||
    node.type === AST_NODE_TYPES.CallExpression
  ) {
    return true;
  }
  if (allowIdentifier && node.type === AST_NODE_TYPES.Identifier) {
    return true;
  }

  /*
  special case for the following, where we only want the left
  - foo !== null
  - foo != null
  - foo !== undefined
  - foo != undefined
  */
  if (
    node.type === AST_NODE_TYPES.BinaryExpression &&
    ['!==', '!='].includes(node.operator) &&
    isValidChainTarget(node.left, allowIdentifier)
  ) {
    if (
      node.right.type === AST_NODE_TYPES.Identifier &&
      node.right.name === 'undefined'
    ) {
      return true;
    }
    if (
      node.right.type === AST_NODE_TYPES.Literal &&
      node.right.value === null
    ) {
      return true;
    }
  }

  return false;
}
