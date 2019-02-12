import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { TSESLintScope } from '@typescript-eslint/experimental-utils';

/** @internal */
export function typeReferencing(
  scope: TSESLintScope.Scope,
  node: TSESTree.Identifier,
  assign?: TSESLintScope.ReferenceFlag,
  writeExpr?: TSESTree.Node | null,
  maybeImplicitGlobal?: boolean,
  partial?: boolean,
  init?: boolean,
): void {
  // because Array element may be null
  if (!node || node.type !== AST_NODE_TYPES.Identifier) {
    return;
  }

  // Specially handle like `this`.
  if (node.name === 'super') {
    return;
  }

  const ref = new TSESLintScope.Reference(
    node,
    scope,
    assign ?? TSESLintScope.Reference.READ,
    writeExpr,
    maybeImplicitGlobal,
    !!partial,
    !!init,
  );

  ref.typeMode = true;

  scope.references.push(ref);
  scope.__left.push(ref);
}
