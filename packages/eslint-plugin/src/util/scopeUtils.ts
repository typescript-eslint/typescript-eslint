import type { TSESTree } from '@typescript-eslint/utils';
import type { Scope, SourceCode } from '@typescript-eslint/utils/ts-eslint';

export function isReferenceToGlobalFunction(
  calleeName: string,
  node: TSESTree.Node,
  sourceCode: SourceCode,
): boolean {
  // The reference is not always in the scope of the node. For example, a
  // `switch` discriminant belongs to the switch scope but is referenced from
  // the scope that contains the `switch`.
  let ref: Scope.Reference | undefined;
  for (
    let scope: Scope.Scope | null = sourceCode.getScope(node);
    scope && !ref;
    scope = scope.upper
  ) {
    ref = scope.references.find(
      ref =>
        ref.identifier.name === calleeName &&
        ref.identifier.range[0] >= node.range[0] &&
        ref.identifier.range[1] <= node.range[1],
    );
  }

  // ensure it's the "global" version
  return !ref?.resolved?.defs.length;
}
