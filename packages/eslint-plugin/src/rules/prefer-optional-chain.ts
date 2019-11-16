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
      'LogicalExpression[operator="&&"] > Identifier'(
        identifier: TSESTree.Identifier,
      ): void {
        const expression = identifier.parent as TSESTree.LogicalExpression;
        if (expression.left !== identifier) {
          // the identifier is not the deepest left node
          return;
        }
        if (!isValidRightChainTarget(expression.right)) {
          // there is nothing to chain with on the right so we can short-circuit the process
          return;
        }

        // walk up the tree to figure out how many logical expressions we can include
        let previous: TSESTree.LogicalExpression = expression;
        let current: TSESTree.Node = expression;
        let previousLeftText = getText(identifier);
        let optionallyChainedCode = previousLeftText;
        while (current.type === AST_NODE_TYPES.LogicalExpression) {
          if (!isValidRightChainTarget(current.right)) {
            break;
          }

          const leftText = previousLeftText;
          const rightText = getText(current.right);
          if (!rightText.startsWith(leftText)) {
            break;
          }
          // omit weird doubled up expression that make no sense like foo.bar && foo.bar
          if (rightText !== leftText) {
            previousLeftText = rightText;

            // diff the left and right text to construct the fix string
            /*
            There are three possible cases:

            1)
            rightText === 'foo.bar.baz.buzz'
            leftText === 'foo.bar.baz'
            rightText.replace(leftText, '') === '.buzz'

            2)
            rightText === 'foo.bar.baz.buzz()'
            leftText === 'foo.bar.baz'
            rightText.replace(leftText, '') === '.buzz()'

            3)
            rightText === 'foo.bar.baz.buzz()'
            leftText === 'foo.bar.baz.buzz'
            rightText.replace(leftText, '') === '()'
            */
            const diff = rightText.replace(leftText, '');
            const needsDot = diff.startsWith('(') || diff.startsWith('[');
            optionallyChainedCode += `?${needsDot ? '.' : ''}${diff}`;
          }

          if (!current.parent) {
            break;
          }
          previous = current;
          current = current.parent;
        }

        context.report({
          node: previous,
          messageId: 'preferOptionalChain',
          fix(fixer) {
            return fixer.replaceText(previous, optionallyChainedCode);
          },
        });
      },
    };

    /**
     * Removes spaces from the source code for the given node:
     * ```
     * foo
     *   .bar
     * ```
     * transformed to
     * ```
     * foo.bar
     * ```
     */
    function getText(node: TSESTree.Node): string {
      return sourceCode.getText(node).replace(WHITESPACE_REGEX, '');
    }
  },
});

function isValidRightChainTarget(
  node: TSESTree.Node,
): node is TSESTree.MemberExpression | TSESTree.CallExpression {
  return (
    node.type === AST_NODE_TYPES.MemberExpression ||
    node.type === AST_NODE_TYPES.CallExpression
  );
}
