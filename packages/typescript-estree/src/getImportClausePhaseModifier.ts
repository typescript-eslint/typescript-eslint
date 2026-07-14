import * as ts from 'typescript';

import { typescriptVersionIsAtLeast } from './version-check';

const isAtLeast59 = typescriptVersionIsAtLeast['5.9'];

type ImportClausePhaseModifier = 'defer' | 'type' | null;

// TODO: Remove when we support TS >= 5.9
export function getImportClausePhaseModifier(
  node: ts.ImportClause | null | undefined,
): ImportClausePhaseModifier {
  if (!node) {
    return null;
  }

  if (isAtLeast59) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- guarded by TS version check.
    return node.phaseModifier === ts.SyntaxKind.TypeKeyword
      ? 'type'
      : // eslint-disable-next-line @typescript-eslint/no-deprecated -- guarded by TS version check
        node.phaseModifier === ts.SyntaxKind.DeferKeyword
        ? 'defer'
        : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- guarded by TS version check
  return node.isTypeOnly ? 'type' : null;
}
