import * as eslintUtils from '@eslint-community/eslint-utils';

import type * as TSESLint from '../../ts-eslint';
import type { TSESTree } from '../../ts-estree';

/**
 * Get the variable of a given name.
 *
 * @see {@link https://eslint-community.github.io/eslint-utils/api/scope-utils.html#findvariable}
 */
const findVariable = eslintUtils.findVariable as (
  initialScope: TSESLint.Scope.Scope,
  nameOrNode: string | TSESTree.Identifier,
) => TSESLint.Scope.Variable | null;

/**
 * Get the innermost scope which contains a given node.
 *
 * @see {@link https://eslint-community.github.io/eslint-utils/api/scope-utils.html#getinnermostscope}
 * @returns The innermost scope which contains the given node.
 * If such scope doesn't exist then it returns the 1st argument `initialScope`.
 */
const getInnermostScope = eslintUtils.getInnermostScope as (
  initialScope: TSESLint.Scope.Scope,
  node: TSESTree.Node,
) => TSESLint.Scope.Scope;

export { findVariable, getInnermostScope };
