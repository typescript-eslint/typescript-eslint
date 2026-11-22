import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import { needsPrecedingSemicolon } from './needsPrecedingSemiColon';

interface WrappingFixerParams {
  /**
   * Descendant of `node` we want to preserve.
   * Use this to replace some code with another.
   * By default it's the node we are modifying (so nothing is removed).
   * You can pass multiple nodes as an array.
   */
  innerNode?: TSESTree.Node | TSESTree.Node[];
  /** The node we want to modify. */
  node: TSESTree.Node;
  /** Source code. */
  sourceCode: Readonly<TSESLint.SourceCode>;
  /**
   * The function which gets the code of the `innerNode` and returns some code around it.
   * Receives multiple arguments if there are multiple innerNodes.
   * E.g. ``code => `${code} != null` ``
   */
  wrap?: (...code: string[]) => string;
}

/**
 * Wraps node with some code. Adds parentheses as necessary.
 * @returns Fixer which adds the specified code and parens if necessary.
 */
export function getWrappingFixer(
  params: WrappingFixerParams,
): (fixer: TSESLint.RuleFixer) => TSESLint.RuleFix {
  const { node, innerNode = node, sourceCode, wrap } = params;
  const innerNodes = Array.isArray(innerNode) ? innerNode : [innerNode];

  return (fixer): TSESLint.RuleFix => {
    const innerCodes = innerNodes.map(innerNode => {
      let code = sourceCode.getText(innerNode);

      /**
       * Wrap our node in parens to prevent the following cases:
       * - It has a weaker precedence than the code we are wrapping it in
       * - It's gotten mistaken as block statement instead of object expression
       */
      if (
        !isStrongPrecedenceNode(innerNode) ||
        isObjectExpressionInOneLineReturn(node, innerNode)
      ) {
        code = `(${code})`;
      }

      return code;
    });

    if (!wrap) {
      return fixer.replaceText(
        node,
        addSemicolonIfNeeded(innerCodes.join(''), node, sourceCode),
      );
    }

    // do the wrapping
    let code = wrap(...innerCodes);

    // check the outer expression's precedence
    if (
      isWeakPrecedenceParent(node) &&
      // we wrapped the node in some expression which very likely has a different precedence than original wrapped node
      // let's wrap the whole expression in parens just in case
      !ASTUtils.isParenthesized(node, sourceCode)
    ) {
      code = `(${code})`;
    }

    return fixer.replaceText(
      node,
      addSemicolonIfNeeded(code, node, sourceCode),
    );
  };
}

/**
 * Prefixes the code with a semicolon if it starts with a token that could
 * continue the previous line, such as `(`, `[`, `` ` ``, `/`, `+`, `-` or `<`,
 * and it's replacing a node at the start of an expression statement that
 * relies on automatic semicolon insertion.
 */
function addSemicolonIfNeeded(
  code: string,
  node: TSESTree.Node,
  sourceCode: Readonly<TSESLint.SourceCode>,
): string {
  if (!/^[(+\-/<[`]/.test(code)) {
    return code;
  }

  const statement = getExpressionStatementStartingWith(node);

  return statement && needsPrecedingSemicolon(sourceCode, statement, code)
    ? `;${code}`
    : code;
}
/**
 * If the node to be moved and the destination node require parentheses, include parentheses in the node to be moved.
 * @param sourceCode Source code of current file
 * @param nodeToMove Nodes that need to be moved
 * @param destinationNode Final destination node with nodeToMove
 * @returns If parentheses are required, code for the nodeToMove node is returned with parentheses at both ends of the code.
 */
export function getMovedNodeCode(params: {
  destinationNode: TSESTree.Node;
  nodeToMove: TSESTree.Node;
  sourceCode: Readonly<TSESLint.SourceCode>;
}): string {
  const { destinationNode, nodeToMove: existingNode, sourceCode } = params;
  const code = sourceCode.getText(existingNode);
  if (isStrongPrecedenceNode(existingNode)) {
    // Moved node never needs parens
    return code;
  }

  if (!isWeakPrecedenceParent(destinationNode)) {
    // Destination would never needs parens, regardless what node moves there
    return code;
  }

  // Parens may be necessary
  return `(${code})`;
}

/**
 * Check if a node will always have the same precedence if its parent changes.
 */
export function isStrongPrecedenceNode(innerNode: TSESTree.Node): boolean {
  return (
    innerNode.type === AST_NODE_TYPES.Literal ||
    innerNode.type === AST_NODE_TYPES.Identifier ||
    innerNode.type === AST_NODE_TYPES.TSTypeReference ||
    innerNode.type === AST_NODE_TYPES.ArrayExpression ||
    innerNode.type === AST_NODE_TYPES.ObjectExpression ||
    innerNode.type === AST_NODE_TYPES.MemberExpression ||
    innerNode.type === AST_NODE_TYPES.CallExpression ||
    innerNode.type === AST_NODE_TYPES.NewExpression ||
    innerNode.type === AST_NODE_TYPES.TaggedTemplateExpression ||
    innerNode.type === AST_NODE_TYPES.TSInstantiationExpression
  );
}

/**
 * Check if a node's parent could have different precedence if the node changes.
 */
export function isWeakPrecedenceParent(node: TSESTree.Node): boolean {
  const parent = node.parent;
  if (!parent) {
    return false;
  }

  if (
    parent.type === AST_NODE_TYPES.UpdateExpression ||
    parent.type === AST_NODE_TYPES.UnaryExpression ||
    parent.type === AST_NODE_TYPES.BinaryExpression ||
    parent.type === AST_NODE_TYPES.LogicalExpression ||
    parent.type === AST_NODE_TYPES.ConditionalExpression ||
    parent.type === AST_NODE_TYPES.AwaitExpression ||
    parent.type === AST_NODE_TYPES.TSNonNullExpression
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
 * Returns the expression statement that `node` is at the very start of, such
 * as the statement of `a` in `a.b?.(c) + d;`, or `undefined` if there's none.
 * A node wrapped in parentheses isn't at the start of its statement, since the
 * parenthesis comes first.
 */
function getExpressionStatementStartingWith(
  node: TSESTree.Node,
): TSESTree.ExpressionStatement | undefined {
  let current = node;

  while (current.type !== AST_NODE_TYPES.ExpressionStatement) {
    const parent = current.parent;
    if (parent?.range[0] !== current.range[0]) {
      return undefined;
    }
    current = parent;
  }

  return current;
}

/**
 * Checks if a node's parent is arrow function expression and a inner node is object expression
 */
function isObjectExpressionInOneLineReturn(
  node: TSESTree.Node,
  innerNode: TSESTree.Node,
): boolean {
  return (
    node.parent?.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    node.parent.body === node &&
    innerNode.type === AST_NODE_TYPES.ObjectExpression
  );
}
