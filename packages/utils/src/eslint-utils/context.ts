// Wrappers around ESLint's deprecation of existing methods
// TODO: Bring this back in once it supports ESLint 9
/* (eslint-disable) deprecation/deprecation -- TODO - delete in the next major (v8) */
import type { Scope, SourceCode } from '../ts-eslint';
import type { RuleContext } from '../ts-eslint/Rule';
import type { TSESTree } from '../ts-estree';

/** @deprecated use `context.sourceCode.getAncestors(node)` */
export function getAncestors(
  context: Readonly<RuleContext<string, unknown[]>>,
): TSESTree.Node[] {
  return context.getAncestors();
}

/** @deprecated use `context.sourceCode.getCwd()` */
export function getCwd(
  context: Readonly<RuleContext<string, unknown[]>>,
): string {
  return context.getCwd();
}

/** @deprecated use `context.sourceCode.getDeclaredVariables(node)` */
export function getDeclaredVariables(
  context: Readonly<RuleContext<string, unknown[]>>,
  node: TSESTree.Node,
): readonly Scope.Variable[] {
  return context.sourceCode.getDeclaredVariables(node);
}

/** @deprecated use `context.filename` */
export function getFilename(
  context: Readonly<RuleContext<string, unknown[]>>,
): string {
  return context.filename;
}

/** @deprecated use `context.sourceCode.getScope(node) */
export function getScope(
  context: Readonly<RuleContext<string, readonly unknown[]>>,
): Scope.Scope {
  return context.getScope();
}

/** @deprecated use `context.sourceCode` */
export function getSourceCode(
  context: Readonly<RuleContext<string, readonly unknown[]>>,
): Readonly<SourceCode> {
  return context.sourceCode;
}
