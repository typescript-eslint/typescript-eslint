import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
  DefinitionType,
  ImplicitLibVariable,
} from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isGlobalScript } from './isGlobalScript';
import { isDefinitionFile } from './misc';

/**
 * How an interface takes part in declaration merging, which a type alias
 * can't do. Rules that turn an interface into a type alias use this to decide
 * whether that's safe.
 *
 * - `'merged'`: another interface or a class of the same name is declared in
 *   the same scope, so a type alias of that name would be a duplicate
 *   identifier.
 * - `'mergeable'`: declarations outside this one can merge with it, so a type
 *   alias may or may not compile, and changes what other code can add. That's
 *   the case inside `declare global`, a `declare module` block or another
 *   ambient namespace, for an interface exported from a namespace (which
 *   another declaration of the namespace can reopen), and in declaration
 *   files, whose top-level interfaces are either globals or exports that
 *   consumers can augment. It's also the case for a top-level interface named
 *   after a lib type (such as `interface Window` or `interface Array<T>`) in
 *   a file without imports or exports, which augments that global type.
 * - `undefined`: converting the interface doesn't affect merging.
 */
export function getInterfaceMerging(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
  node: TSESTree.TSInterfaceDeclaration,
): 'mergeable' | 'merged' | undefined {
  const isMerged = context.sourceCode
    .getDeclaredVariables(node)
    .find(variable => variable.name === node.id.name)
    ?.defs.some(
      def =>
        def.node !== node &&
        (def.type === DefinitionType.Type ||
          def.type === DefinitionType.ClassName),
    );
  if (isMerged) {
    return 'merged';
  }

  if (isDefinitionFile(context.filename)) {
    return 'mergeable';
  }

  // In a global script, a top-level interface merges with the lib type of the
  // same name. Other global declarations aren't known, so only lib types count.
  if (
    node.parent.type === AST_NODE_TYPES.Program &&
    isGlobalScript(context.sourceCode) &&
    context.sourceCode.scopeManager?.globalScope?.set.get(
      node.id.name,
    ) instanceof ImplicitLibVariable
  ) {
    return 'mergeable';
  }

  if (
    node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration &&
    node.parent.parent.type === AST_NODE_TYPES.TSModuleBlock
  ) {
    return 'mergeable';
  }

  for (
    let ancestor: TSESTree.Node | undefined = node.parent;
    ancestor;
    ancestor = ancestor.parent
  ) {
    if (
      ancestor.type === AST_NODE_TYPES.TSModuleDeclaration &&
      (ancestor.declare ||
        ancestor.kind === 'global' ||
        ancestor.id.type === AST_NODE_TYPES.Literal)
    ) {
      return 'mergeable';
    }
  }

  return undefined;
}
