import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { getStaticMemberAccessValue } from './misc';

/**
 * @return `true` if the function or method node has overload signatures.
 */
export function hasOverloadSignatures(
  node: TSESTree.FunctionDeclaration | TSESTree.MethodDefinition,
  context: RuleContext<string, unknown[]>,
): boolean {
  // `export default function () {}`
  if (node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
    for (const member of node.parent.parent.body) {
      if (
        member.type === AST_NODE_TYPES.ExportDefaultDeclaration &&
        member.declaration.type === AST_NODE_TYPES.TSDeclareFunction
      ) {
        return true;
      }
    }

    return false;
  }

  // `export function f() {}`
  if (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    for (const member of node.parent.parent.body) {
      if (
        member.type === AST_NODE_TYPES.ExportNamedDeclaration &&
        member.declaration?.type === AST_NODE_TYPES.TSDeclareFunction &&
        getFunctionDeclarationName(member.declaration, context) ===
          getFunctionDeclarationName(node, context)
      ) {
        return true;
      }
    }

    return false;
  }

  // either:
  // - `function f() {}`
  // - `class T { foo() {} }`
  const nodeKey = getFunctionDeclarationName(node, context);

  for (const member of node.parent.body) {
    if (
      member.type !== AST_NODE_TYPES.TSDeclareFunction &&
      (member.type !== AST_NODE_TYPES.MethodDefinition ||
        member.value.type === AST_NODE_TYPES.FunctionExpression)
    ) {
      continue;
    }

    if (nodeKey === getFunctionDeclarationName(member, context)) {
      return true;
    }
  }

  return false;
}

function getFunctionDeclarationName(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.MethodDefinition
    | TSESTree.TSDeclareFunction,
  context: RuleContext<string, unknown[]>,
): string | symbol | undefined {
  if (
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.TSDeclareFunction
  ) {
    // For a `FunctionDeclaration` or `TSDeclareFunction` this may be `null` if
    // and only if the parent is an `ExportDefaultDeclaration`.
    //
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return node.id!.name;
  }

  return getStaticMemberAccessValue(node, context);
}
