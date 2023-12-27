// Wrappers around ESLint's deprecation of existing methods
// We'll be able to drop them once we no longer support ESLint <8.40.0.
/* eslint-disable @typescript-eslint/no-unnecessary-condition, deprecation/deprecation */
import type { Scope, SourceCode } from '../ts-eslint';
import type { RuleContext } from '../ts-eslint/Rule';
import type { TSESTree } from '../ts-estree';

export function getAncestors(context: Readonly<RuleContext>): TSESTree.Node[] {
  // TODO: Use `SourceCode#getAncestors` (we'll be forced to soon)
  return context.getAncestors();
}

export function getCwd(context: Readonly<RuleContext>): string {
  return context.cwd ?? context.getCwd();
}

export function getDeclaredVariables(
  context: Readonly<RuleContext>,
  node: TSESTree.Node,
): readonly Scope.Variable[] {
  const sourceCode = getSourceCode(context);
  return (
    sourceCode.getDeclaredVariables?.(node) ??
    context.getDeclaredVariables(node)
  );
}

export function getFilename(context: Readonly<RuleContext>): string {
  return context.filename ?? context.getFilename();
}

export function getScope(
  context: Readonly<RuleContext<string, readonly unknown[]>>,
): Scope.Scope {
  // TODO: Use `SourceCode#getScope` (we'll be forced to soon)
  return context.getScope();
}

export function getSourceCode(
  context: Readonly<RuleContext<string, readonly unknown[]>>,
): Readonly<SourceCode> {
  return context.sourceCode ?? context.getSourceCode();
}
