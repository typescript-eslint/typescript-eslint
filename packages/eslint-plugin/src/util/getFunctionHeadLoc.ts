import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression
  | TSESTree.FunctionDeclaration;

/**
 * Creates a report location for the given function.
 * The location only encompasses the "start" of the function, and not the body
 *
 * eg.
 *
 * ```
 * function foo(args) {}
 * ^^^^^^^^^^^^^^^^^^
 *
 * get y(args) {}
 * ^^^^^^^^^^^
 *
 * const x = (args) => {}
 *           ^^^^^^^^^
 * ```
 */
export function getFunctionHeadLoc(
  node: FunctionNode,
  sourceCode: TSESLint.SourceCode,
): TSESTree.SourceLocation {
  /**
   * Returns start column position
   * @param node
   */
  function getLocStart(): TSESTree.LineAndColumnData {
    /* highlight method name */
    const parent = node.parent;
    if (
      parent &&
      (parent.type === AST_NODE_TYPES.MethodDefinition ||
        (parent.type === AST_NODE_TYPES.Property && parent.method))
    ) {
      return parent.loc.start;
    }

    return node.loc.start;
  }

  /**
   * Returns end column position
   * @param node
   */
  function getLocEnd(): TSESTree.LineAndColumnData {
    /* highlight `=>` */
    if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
      return sourceCode.getTokenBefore(
        node.body,
        token =>
          token.type === AST_TOKEN_TYPES.Punctuator && token.value === '=>',
      )!.loc.end;
    }

    return sourceCode.getTokenBefore(node.body)!.loc.end;
  }

  return {
    start: getLocStart(),
    end: getLocEnd(),
  };
}
