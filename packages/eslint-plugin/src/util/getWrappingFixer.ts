import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

interface WrappingFixerParams {
  /** Source code. */
  sourceCode: Readonly<TSESLint.SourceCode>;
  /** The node we want to modify. */
  node: TSESTree.Node;
  /**
   * Descendant of `node` we want to preserve.
   * Use this to replace some code with another.
   * By default it's the node we are modifying (so nothing is removed).
   */
  innerNode?: TSESTree.Node;
  /**
   * The function which gets the code of the `innerNode` and returns some code around it.
   * E.g. ``code => `${code} != null` ``
   */
  wrap: (code: string) => string;
}

/**
 * Wraps node with some code. Adds parenthesis as necessary.
 * @returns Fixer which adds the specified code and parens if necessary.
 */
export function getWrappingFixer(
  params: WrappingFixerParams,
): TSESLint.ReportFixFunction {
  const { sourceCode, node, innerNode = node, wrap } = params;
  return (fixer): TSESLint.RuleFix => {
    let code = sourceCode.getText(innerNode);

    // check the inner expression's precedence
    if (
      innerNode.type !== AST_NODE_TYPES.Literal &&
      innerNode.type !== AST_NODE_TYPES.Identifier &&
      innerNode.type !== AST_NODE_TYPES.MemberExpression &&
      innerNode.type !== AST_NODE_TYPES.CallExpression
    ) {
      // we are wrapping something else than a simple variable or function call
      // the code we are adding might have stronger precedence than our wrapped node
      // let's wrap our node in parens in case it has a weaker precedence than the code we are wrapping it in
      code = `(${code})`;
    }

    // do the wrapping
    code = wrap(code);

    let parent = util.nullThrows(
      node.parent,
      util.NullThrowsReasons.MissingParent,
    );

    // check the outer expression's precedence
    if (
      parent.type !== AST_NODE_TYPES.IfStatement &&
      parent.type !== AST_NODE_TYPES.ForStatement &&
      parent.type !== AST_NODE_TYPES.WhileStatement &&
      parent.type !== AST_NODE_TYPES.DoWhileStatement
    ) {
      // the whole expression's parent is something else than condition of if/for/while
      // we wrapped the node in some expression which very likely has a different precedence than original wrapped node
      // let's wrap the whole expression in parens just in case
      if (!util.isParenthesized(node, sourceCode)) {
        code = `(${code})`;
      }
    }

    // check if we need to insert semicolon
    for (;;) {
      const prevParent = parent;
      parent = parent.parent!;
      if (
        parent.type === AST_NODE_TYPES.LogicalExpression ||
        parent.type === AST_NODE_TYPES.BinaryExpression
      ) {
        if (parent.left === prevParent) {
          // the next parent is a binary expression and current node is on the left
          continue;
        }
      }
      if (parent.type === AST_NODE_TYPES.ExpressionStatement) {
        const block = parent.parent!;
        if (
          block.type === AST_NODE_TYPES.Program ||
          block.type === AST_NODE_TYPES.BlockStatement
        ) {
          // the next parent is an expression in a block
          const statementIndex = block.body.indexOf(parent);
          const previousStatement = block.body[statementIndex - 1];
          if (
            statementIndex > 0 &&
            sourceCode.getLastToken(previousStatement)!.value !== ';'
          ) {
            // the previous statement in a block doesn't end with a semicolon
            code = `;${code}`;
          }
        }
      }
      break;
    }

    return fixer.replaceText(node, code);
  };
}
