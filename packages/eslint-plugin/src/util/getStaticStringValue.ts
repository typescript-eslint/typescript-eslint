// adapted from https://github.com/eslint/eslint/blob/5bdaae205c3a0089ea338b382df59e21d5b06436/lib/rules/utils/ast-utils.js#L191-L230

import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isNullLiteral } from './isNullLiteral';

/**
 * Returns the result of the string conversion applied to the evaluated value of the given expression node,
 * if it can be determined statically.
 *
 * This function returns a `string` value for all `Literal` nodes and simple `TemplateLiteral` nodes only.
 * In all other cases, this function returns `null`.
 * @param node Expression node.
 * @returns String value if it can be determined. Otherwise, `null`.
 */
export function getStaticStringValue(node: TSESTree.Node): string | null {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
      // eslint-disable-next-line eqeqeq -- intentional strict comparison for literal value
      if (node.value === null) {
        if (isNullLiteral(node)) {
          return String(node.value); // "null"
        }
        if ('regex' in node) {
          return `/${node.regex.pattern}/${node.regex.flags}`;
        }

        if ('bigint' in node) {
          return node.bigint;
        }

        // Otherwise, this is an unknown literal. The function will return null.
      } else {
        return String(node.value);
      }
      break;

    case AST_NODE_TYPES.TemplateLiteral:
      if (node.expressions.length === 0 && node.quasis.length === 1) {
        return node.quasis[0].value.cooked;
      }
      break;

    // no default
  }

  return null;
}
