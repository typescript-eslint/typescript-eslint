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
  function getLocStart(): TSESTree.LineAndColumnData {
    if (node.parent && node.parent.type === AST_NODE_TYPES.MethodDefinition) {
      // return the start location for class method

      if (node.parent.decorators && node.parent.decorators.length > 0) {
        // exclude decorators
        return sourceCode.getTokenAfter(
          node.parent.decorators[node.parent.decorators.length - 1],
        )!.loc.start;
      }

      return node.parent.loc.start;
    }

    if (
      node.parent &&
      node.parent.type === AST_NODE_TYPES.Property &&
      node.parent.method
    ) {
      // return the start location for object method shorthand
      return node.parent.loc.start;
    }

    // return the start location for a regular function
    return node.loc.start;
  }

  function getLocEnd(): TSESTree.LineAndColumnData {
    if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
      // find the end location for arrow function expression
      return sourceCode.getTokenBefore(
        node.body,
        token =>
          token.type === AST_TOKEN_TYPES.Punctuator && token.value === '=>',
      )!.loc.end;
    }

    // return the end location for a regular function
    return sourceCode.getTokenBefore(node.body)!.loc.end;
  }

  return {
    start: getLocStart(),
    end: getLocEnd(),
  };
}
