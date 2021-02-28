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

    // check the outer expression's precedence
    if (
      node.parent != null &&
      node.parent.type !== AST_NODE_TYPES.IfStatement &&
      node.parent.type !== AST_NODE_TYPES.ForStatement &&
      node.parent.type !== AST_NODE_TYPES.WhileStatement &&
      node.parent.type !== AST_NODE_TYPES.DoWhileStatement
    ) {
      // the whole expression's parent is something else than condition of if/for/while
      // we wrapped the node in some expression which very likely has a different precedence than original wrapped node
      // let's wrap the whole expression in parens just in case
      if (!util.isParenthesized(node, sourceCode)) {
        code = `(${code})`;
      }
    }

    return fixer.replaceText(node, code);
  };
}
