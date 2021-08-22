import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { SourceCode } from '@typescript-eslint/experimental-utils/src/ts-eslint';
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
   * You can pass multiple nodes as an array.
   */
  innerNode?: TSESTree.Node | TSESTree.Node[];
  /**
   * The function which gets the code of the `innerNode` and returns some code around it.
   * Receives multiple arguments if there are multiple innerNodes.
   * E.g. ``code => `${code} != null` ``
   */
  wrap: (...code: string[]) => string;
}

/**
 * Wraps node with some code. Adds parenthesis as necessary.
 * @returns Fixer which adds the specified code and parens if necessary.
 */
export function getWrappingFixer(
  params: WrappingFixerParams,
): TSESLint.ReportFixFunction {
  const { sourceCode, node, innerNode = node, wrap } = params;
  const innerNodes = Array.isArray(innerNode) ? innerNode : [innerNode];

  return (fixer): TSESLint.RuleFix => {
    const innerCodes = innerNodes.map(innerNode => {
      let code = sourceCode.getText(innerNode);

      // check the inner expression's precedence
      if (!isStrongPrecedenceNode(innerNode)) {
        // the code we are adding might have stronger precedence than our wrapped node
        // let's wrap our node in parens in case it has a weaker precedence than the code we are wrapping it in
        code = `(${code})`;
      }

      return code;
    });

    // do the wrapping
    let code = wrap(...innerCodes);

    // check the outer expression's precedence
    if (isWeakPrecedenceParent(node)) {
      // we wrapped the node in some expression which very likely has a different precedence than original wrapped node
      // let's wrap the whole expression in parens just in case
      if (!util.isParenthesized(node, sourceCode)) {
        code = `(${code})`;
      }
    }

    // check if we need to insert semicolon
    if (/^[`([]/.exec(code) && isMissingSemicolonBefore(node, sourceCode)) {
      code = `;${code}`;
    }

    return fixer.replaceText(node, code);
  };
}

/**
 * Check if a node will always have the same precedence if it's parent changes.
 */
function isStrongPrecedenceNode(innerNode: TSESTree.Node): boolean {
  return (
    innerNode.type === AST_NODE_TYPES.Literal ||
    innerNode.type === AST_NODE_TYPES.Identifier ||
    innerNode.type === AST_NODE_TYPES.ArrayExpression ||
    innerNode.type === AST_NODE_TYPES.ObjectExpression ||
    innerNode.type === AST_NODE_TYPES.MemberExpression ||
    innerNode.type === AST_NODE_TYPES.CallExpression ||
    innerNode.type === AST_NODE_TYPES.NewExpression ||
    innerNode.type === AST_NODE_TYPES.TaggedTemplateExpression
  );
}

/**
 * Check if a node's parent could have different precedence if the node changes.
 */
function isWeakPrecedenceParent(node: TSESTree.Node): boolean {
  const parent = node.parent!;

  if (
    parent.type === AST_NODE_TYPES.UpdateExpression ||
    parent.type === AST_NODE_TYPES.UnaryExpression ||
    parent.type === AST_NODE_TYPES.BinaryExpression ||
    parent.type === AST_NODE_TYPES.LogicalExpression ||
    parent.type === AST_NODE_TYPES.ConditionalExpression ||
    parent.type === AST_NODE_TYPES.AwaitExpression
  ) {
    return true;
  }

  if (
    parent.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === node
  ) {
    return true;
  }

  if (
    (parent.type === AST_NODE_TYPES.CallExpression ||
      parent.type === AST_NODE_TYPES.NewExpression) &&
    parent.callee === node
  ) {
    return true;
  }

  if (
    parent.type === AST_NODE_TYPES.TaggedTemplateExpression &&
    parent.tag === node
  ) {
    return true;
  }

  return false;
}

/**
 * Returns true if a node is at the beginning of expression statement and the statement above doesn't end with semicolon.
 * Doesn't check if the node begins with `(`, `[` or `` ` ``.
 */
function isMissingSemicolonBefore(
  node: TSESTree.Node,
  sourceCode: SourceCode,
): boolean {
  for (;;) {
    const parent = node.parent!;

    if (parent.type === AST_NODE_TYPES.ExpressionStatement) {
      const block = parent.parent!;
      if (
        block.type === AST_NODE_TYPES.Program ||
        block.type === AST_NODE_TYPES.BlockStatement
      ) {
        // parent is an expression statement in a block
        const statementIndex = block.body.indexOf(parent);
        const previousStatement = block.body[statementIndex - 1];
        if (
          statementIndex > 0 &&
          sourceCode.getLastToken(previousStatement)!.value !== ';'
        ) {
          return true;
        }
      }
    }

    if (!isLeftHandSide(node)) {
      return false;
    }

    node = parent;
  }
}

/**
 * Checks if a node is LHS of an operator.
 */
function isLeftHandSide(node: TSESTree.Node): boolean {
  const parent = node.parent!;

  // a++
  if (parent.type === AST_NODE_TYPES.UpdateExpression) {
    return true;
  }

  // a + b
  if (
    (parent.type === AST_NODE_TYPES.BinaryExpression ||
      parent.type === AST_NODE_TYPES.LogicalExpression ||
      parent.type === AST_NODE_TYPES.AssignmentExpression) &&
    node === parent.left
  ) {
    return true;
  }

  // a ? b : c
  if (
    parent.type === AST_NODE_TYPES.ConditionalExpression &&
    node === parent.test
  ) {
    return true;
  }

  // a(b)
  if (parent.type === AST_NODE_TYPES.CallExpression && node === parent.callee) {
    return true;
  }

  // a`b`
  if (
    parent.type === AST_NODE_TYPES.TaggedTemplateExpression &&
    node === parent.tag
  ) {
    return true;
  }

  return false;
}
