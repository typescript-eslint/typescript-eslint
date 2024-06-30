// adapted from https://github.com/eslint/eslint/blob/5bdaae205c3a0089ea338b382df59e21d5b06436/lib/rules/utils/ast-utils.js#L1668-L1787

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

import { isArrowToken, isOpeningParenToken } from './astUtils';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

/**
 * Gets the `(` token of the given function node.
 * @param node The function node to get.
 * @param sourceCode The source code object to get tokens.
 * @returns `(` token.
 */
function getOpeningParenOfParams(
  node: FunctionNode,
  sourceCode: TSESLint.SourceCode,
): TSESTree.Token {
  // If the node is an arrow function and doesn't have parens, this returns the identifier of the first param.
  if (
    node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    node.params.length === 1
  ) {
    const argToken = ESLintUtils.nullThrows(
      sourceCode.getFirstToken(node.params[0]),
      ESLintUtils.NullThrowsReasons.MissingToken('parameter', 'arrow function'),
    );
    const maybeParenToken = sourceCode.getTokenBefore(argToken);

    return maybeParenToken && isOpeningParenToken(maybeParenToken)
      ? maybeParenToken
      : argToken;
  }

  // Otherwise, returns paren.
  return node.id != null
    ? ESLintUtils.nullThrows(
        sourceCode.getTokenAfter(node.id, isOpeningParenToken),
        ESLintUtils.NullThrowsReasons.MissingToken('id', 'function'),
      )
    : ESLintUtils.nullThrows(
        sourceCode.getFirstToken(node, isOpeningParenToken),
        ESLintUtils.NullThrowsReasons.MissingToken(
          'opening parenthesis',
          'function',
        ),
      );
}

/**
 * Gets the location of the given function node for reporting.
 *
 * - `function foo() {}`
 *    ^^^^^^^^^^^^
 * - `(function foo() {})`
 *     ^^^^^^^^^^^^
 * - `(function() {})`
 *     ^^^^^^^^
 * - `function* foo() {}`
 *    ^^^^^^^^^^^^^
 * - `(function* foo() {})`
 *     ^^^^^^^^^^^^^
 * - `(function*() {})`
 *     ^^^^^^^^^
 * - `() => {}`
 *       ^^
 * - `async () => {}`
 *             ^^
 * - `({ foo: function foo() {} })`
 *       ^^^^^^^^^^^^^^^^^
 * - `({ foo: function() {} })`
 *       ^^^^^^^^^^^^^
 * - `({ ['foo']: function() {} })`
 *       ^^^^^^^^^^^^^^^^^
 * - `({ [foo]: function() {} })`
 *       ^^^^^^^^^^^^^^^
 * - `({ foo() {} })`
 *       ^^^
 * - `({ foo: function* foo() {} })`
 *       ^^^^^^^^^^^^^^^^^^
 * - `({ foo: function*() {} })`
 *       ^^^^^^^^^^^^^^
 * - `({ ['foo']: function*() {} })`
 *       ^^^^^^^^^^^^^^^^^^
 * - `({ [foo]: function*() {} })`
 *       ^^^^^^^^^^^^^^^^
 * - `({ *foo() {} })`
 *       ^^^^
 * - `({ foo: async function foo() {} })`
 *       ^^^^^^^^^^^^^^^^^^^^^^^
 * - `({ foo: async function() {} })`
 *       ^^^^^^^^^^^^^^^^^^^
 * - `({ ['foo']: async function() {} })`
 *       ^^^^^^^^^^^^^^^^^^^^^^^
 * - `({ [foo]: async function() {} })`
 *       ^^^^^^^^^^^^^^^^^^^^^
 * - `({ async foo() {} })`
 *       ^^^^^^^^^
 * - `({ get foo() {} })`
 *       ^^^^^^^
 * - `({ set foo(a) {} })`
 *       ^^^^^^^
 * - `class A { constructor() {} }`
 *              ^^^^^^^^^^^
 * - `class A { foo() {} }`
 *              ^^^
 * - `class A { *foo() {} }`
 *              ^^^^
 * - `class A { async foo() {} }`
 *              ^^^^^^^^^
 * - `class A { ['foo']() {} }`
 *              ^^^^^^^
 * - `class A { *['foo']() {} }`
 *              ^^^^^^^^
 * - `class A { async ['foo']() {} }`
 *              ^^^^^^^^^^^^^
 * - `class A { [foo]() {} }`
 *              ^^^^^
 * - `class A { *[foo]() {} }`
 *              ^^^^^^
 * - `class A { async [foo]() {} }`
 *              ^^^^^^^^^^^
 * - `class A { get foo() {} }`
 *              ^^^^^^^
 * - `class A { set foo(a) {} }`
 *              ^^^^^^^
 * - `class A { static foo() {} }`
 *              ^^^^^^^^^^
 * - `class A { static *foo() {} }`
 *              ^^^^^^^^^^^
 * - `class A { static async foo() {} }`
 *              ^^^^^^^^^^^^^^^^
 * - `class A { static get foo() {} }`
 *              ^^^^^^^^^^^^^^
 * - `class A { static set foo(a) {} }`
 *              ^^^^^^^^^^^^^^
 * - `class A { foo = function() {} }`
 *              ^^^^^^^^^^^^^^
 * - `class A { static foo = function() {} }`
 *              ^^^^^^^^^^^^^^^^^^^^^
 * - `class A { foo = (a, b) => {} }`
 *              ^^^^^^
 * @param node The function node to get.
 * @param sourceCode The source code object to get tokens.
 * @returns The location of the function node for reporting.
 */
export function getFunctionHeadLoc(
  node: FunctionNode,
  sourceCode: TSESLint.SourceCode,
): TSESTree.SourceLocation {
  const parent = node.parent;
  let start: TSESTree.Position | null = null;
  let end: TSESTree.Position | null = null;

  if (
    parent.type === AST_NODE_TYPES.MethodDefinition ||
    parent.type === AST_NODE_TYPES.PropertyDefinition
  ) {
    // the decorator's range is included within the member
    // however it's usually irrelevant to the member itself - so we don't want
    // to highlight it ever.
    if (parent.decorators.length > 0) {
      const lastDecorator = parent.decorators[parent.decorators.length - 1];
      const firstTokenAfterDecorator = ESLintUtils.nullThrows(
        sourceCode.getTokenAfter(lastDecorator),
        ESLintUtils.NullThrowsReasons.MissingToken(
          'modifier or member name',
          'class member',
        ),
      );
      start = firstTokenAfterDecorator.loc.start;
    } else {
      start = parent.loc.start;
    }
    end = getOpeningParenOfParams(node, sourceCode).loc.start;
  } else if (parent.type === AST_NODE_TYPES.Property) {
    start = parent.loc.start;
    end = getOpeningParenOfParams(node, sourceCode).loc.start;
  } else if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
    const arrowToken = ESLintUtils.nullThrows(
      sourceCode.getTokenBefore(node.body, isArrowToken),
      ESLintUtils.NullThrowsReasons.MissingToken(
        'arrow token',
        'arrow function',
      ),
    );

    start = arrowToken.loc.start;
    end = arrowToken.loc.end;
  } else {
    start = node.loc.start;
    end = getOpeningParenOfParams(node, sourceCode).loc.start;
  }

  return {
    start: Object.assign({}, start),
    end: Object.assign({}, end),
  };
}
