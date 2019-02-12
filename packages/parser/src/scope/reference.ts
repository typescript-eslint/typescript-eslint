import { Scope } from 'eslint-scope/lib/scope';
import Reference, { ReferenceFlag } from 'eslint-scope/lib/reference';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

/** @internal */
export function typeReferencing(
  scope: Scope,
  node: TSESTree.Identifier,
  assign?: ReferenceFlag,
  writeExpr?: TSESTree.Node | null,
  maybeImplicitGlobal?: boolean,
  partial?: boolean,
  init?: boolean
) {
  // because Array element may be null
  if (!node || node.type !== AST_NODE_TYPES.Identifier) {
    return;
  }

  // Specially handle like `this`.
  if (node.name === 'super') {
    return;
  }

  const ref = new Reference(
    node,
    scope,
    assign || Reference.READ,
    writeExpr,
    maybeImplicitGlobal,
    !!partial,
    !!init
  );

  ref.typeMode = true;

  scope.references.push(ref);
  scope.__left.push(ref);
}
