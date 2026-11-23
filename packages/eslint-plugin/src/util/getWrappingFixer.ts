import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  isDirectivePrologueExpression,
  isExpressionStartNeedingParentheses,
} from './expressionStartUtils';
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

    let code: string;

    if (wrap) {
      code = wrap(...innerCodes);

      // check the outer expression's precedence
      if (
        isWeakPrecedenceParent(node) &&
        // we wrapped the node in some expression which very likely has a different precedence than original wrapped node
        // let's wrap the whole expression in parens just in case
        !ASTUtils.isParenthesized(node, sourceCode) &&
        // a non-null assertion only needs them around looser code than `a.b(c)`
        !(
          node.parent?.type === AST_NODE_TYPES.TSNonNullExpression &&
          isWrapLeftHandSideExpression(wrap, innerCodes.length)
        )
      ) {
        code = `(${code})`;
      }
    } else {
      code = innerCodes.join('');
    }

    // The code mustn't start a block, a declaration or a directive.
    if (
      startsWithInnerCodeNeedingParentheses(
        code,
        node,
        innerNodes,
        innerCodes,
        sourceCode,
      )
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
 * Whether the code starts with one of the inner nodes' unchanged code, such as
 * `{ a }.a` or `function () {}.name`, that would make it start a block, a
 * declaration or a directive instead of an expression where `node` is.
 */
function startsWithInnerCodeNeedingParentheses(
  code: string,
  node: TSESTree.Node,
  innerNodes: TSESTree.Node[],
  innerCodes: string[],
  sourceCode: Readonly<TSESLint.SourceCode>,
): boolean {
  return innerNodes.some((innerNode, index) => {
    const innerCode = innerCodes[index];
    if (
      innerCode !== sourceCode.getText(innerNode) ||
      !code.startsWith(innerCode)
    ) {
      return false;
    }

    const firstToken = ESLintUtils.nullThrows(
      sourceCode.getFirstToken(innerNode),
      ESLintUtils.NullThrowsReasons.MissingToken('first token', innerNode.type),
    );

    return (
      isExpressionStartNeedingParentheses(node, firstToken, sourceCode) ||
      (code === innerCode &&
        innerNode.type === AST_NODE_TYPES.Literal &&
        typeof innerNode.value === 'string' &&
        isDirectivePrologueExpression(node, sourceCode))
    );
  });
}

/**
 * Whether `wrap` produces a left-hand side expression, such as `a.b(c)`,
 * which binds at least as tightly as a member access. The inner codes are
 * either tightly binding or parenthesized, so stand-in identifiers give the
 * code the same shape.
 */
function isWrapLeftHandSideExpression(
  wrap: (...code: string[]) => string,
  innerCodeCount: number,
): boolean {
  const sourceFile = ts.createSourceFile(
    'wrap.ts',
    wrap(...Array.from({ length: innerCodeCount }, (_, index) => `_${index}`)),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.TS,
  );
  const [statement] = sourceFile.statements;

  if (
    sourceFile.statements.length !== 1 ||
    !ts.isExpressionStatement(statement)
  ) {
    return false;
  }

  const { expression } = statement;

  switch (expression.kind) {
    case ts.SyntaxKind.CallExpression:
    case ts.SyntaxKind.ElementAccessExpression:
    case ts.SyntaxKind.Identifier:
    case ts.SyntaxKind.NonNullExpression:
    case ts.SyntaxKind.ParenthesizedExpression:
    case ts.SyntaxKind.PropertyAccessExpression:
    case ts.SyntaxKind.TaggedTemplateExpression:
      return true;

    case ts.SyntaxKind.NewExpression:
      // `new A!` would assert `A`, not the new instance.
      return (expression as ts.NewExpression).arguments != null;

    default:
      return false;
  }
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
 * A node wrapped in parentheses at the start of a member access, call, tagged
 * template or non-null assertion, as in `(a + b)!`, keeps them when it's
 * replaced, so the parent can't be affected.
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
    parent.type === AST_NODE_TYPES.AwaitExpression
  ) {
    return true;
  }

  // These parents start with the node, so anything before it is a parenthesis.
  const isUnparenthesizedStart = parent.range[0] === node.range[0];

  if (parent.type === AST_NODE_TYPES.TSNonNullExpression) {
    return isUnparenthesizedStart;
  }

  if (
    parent.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === node
  ) {
    return isUnparenthesizedStart;
  }

  if (parent.type === AST_NODE_TYPES.CallExpression && parent.callee === node) {
    return isUnparenthesizedStart;
  }

  if (parent.type === AST_NODE_TYPES.NewExpression && parent.callee === node) {
    return true;
  }

  if (
    parent.type === AST_NODE_TYPES.TaggedTemplateExpression &&
    parent.tag === node
  ) {
    return isUnparenthesizedStart;
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
