import type { TSESTree } from '@typescript-eslint/utils';
import type { Scope, SourceCode } from '@typescript-eslint/utils/ts-eslint';

import { DefinitionType, ScopeType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isGlobalScript } from './isGlobalScript';
import { isDefinitionFile } from './misc';

export interface GlobalLookupOptions {
  /**
   * Whether declarations at the top level of the file are globals rather than
   * local declarations that hide the globals, as in a TypeScript global script
   * (see `isGlobalScript`), where they merge with lib declarations.
   *
   * `isGlobalScript` can be wrong outside declaration files (see
   * `isGlobalScriptDeclarationFile`), so pass `isGlobalScript(...)` here only
   * where wrongly treating a local declaration as the global makes the rule
   * skip a report rather than add one.
   */
  topLevelIsGlobal?: boolean;
}

export interface ShadowLookupOptions extends GlobalLookupOptions {
  /**
   * The node where the name is, or where a fix would write it. TypeScript
   * makes an `infer` type parameter visible only in the true branch of its
   * conditional type and in its own constraint, but `sourceCode.getScope`
   * gives the conditional type's scope for any node in it, including in its
   * false branch. Without this, an `infer` type parameter shadows the name
   * anywhere in its conditional type.
   */
  node?: TSESTree.Node;
}

/**
 * Whether the file is a declaration file that TypeScript treats as a global
 * script. Unlike for other files, `isGlobalScript` is exact here, because
 * `moduleDetection: "force"` and the other ways a file without imports or
 * exports can become a module don't apply to declaration files.
 */
export function isGlobalScriptDeclarationFile(
  filename: string,
  sourceCode: Readonly<Pick<SourceCode, 'ast'>>,
): boolean {
  return isDefinitionFile(filename) && isGlobalScript(sourceCode);
}

/**
 * Whether a namespace declares a value, so that its name shadows a global
 * value. This follows TypeScript's `getModuleInstanceState`, except that an
 * `export { ... }` (an error in a namespace) always counts as a value.
 */
function isInstantiatedNamespace(node: TSESTree.TSModuleDeclaration): boolean {
  return !node.body || node.body.body.some(isInstantiatedStatement);
}

function isInstantiatedStatement(node: TSESTree.Node): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.TSInterfaceDeclaration:
    case AST_NODE_TYPES.TSTypeAliasDeclaration:
      return false;
    // a non-exported `import x = N.y` only aliases
    case AST_NODE_TYPES.TSImportEqualsDeclaration:
      return false;
    case AST_NODE_TYPES.TSModuleDeclaration:
      return isInstantiatedNamespace(node);
    case AST_NODE_TYPES.ExportNamedDeclaration:
      return (
        node.declaration == null ||
        // `export import x = N.y` is a value
        node.declaration.type === AST_NODE_TYPES.TSImportEqualsDeclaration ||
        isInstantiatedStatement(node.declaration)
      );
    default:
      // a `const enum` also counts, as does `;`
      return true;
  }
}

/**
 * Whether a definition gives its name the meaning a reference looks for.
 * A namespace is never a type, and it's a value only if it contains values.
 */
function givesMeaning(
  definition: Scope.Definition,
  meaning: 'type' | 'value',
): boolean {
  if (meaning === 'type') {
    return (
      definition.isTypeDefinition &&
      definition.type !== DefinitionType.TSModuleName
    );
  }

  return (
    definition.isVariableDefinition &&
    (definition.type !== DefinitionType.TSModuleName ||
      isInstantiatedNamespace(definition.node))
  );
}

function isNodeWithin(node: TSESTree.Node, container: TSESTree.Node): boolean {
  return (
    node.range[0] >= container.range[0] && node.range[1] <= container.range[1]
  );
}

/**
 * Whether a definition is an `infer` type parameter that isn't visible at
 * `node`, because `node` is outside both its conditional type's true branch
 * and its own `infer` type, which holds its constraint.
 */
function isInferTypeParameterOutOfScope(
  definition: Scope.Definition,
  node: TSESTree.Node,
): boolean {
  if (
    definition.node.type !== AST_NODE_TYPES.TSTypeParameter ||
    definition.node.parent.type !== AST_NODE_TYPES.TSInferType
  ) {
    return false;
  }

  // In `infer T extends C`, TypeScript makes `T` visible in `C` but not in
  // the constraints of other `infer` type parameters.
  if (isNodeWithin(node, definition.node.parent)) {
    return false;
  }

  let child: TSESTree.Node = definition.node.parent;
  let parent: TSESTree.Node | undefined = child.parent;
  while (parent) {
    if (
      parent.type === AST_NODE_TYPES.TSConditionalType &&
      parent.extendsType === child
    ) {
      return !isNodeWithin(node, parent.trueType);
    }
    child = parent;
    parent = parent.parent;
  }

  // `infer` outside of an `extends` clause is an error
  return false;
}

function isTopLevelScope(scope: Scope.Scope): boolean {
  return scope.type === ScopeType.global || scope.type === ScopeType.module;
}

/**
 * Finds the declared variable that a type or value reference to `name` from
 * `scope` resolves to instead of the global of that name, if any. Unlike the
 * scope manager, this follows how TypeScript resolves names:
 *
 * - A namespace never shadows a global type, and shadows a global value only
 *   if it contains values (`namespace setTimeout { export const x = 1 }`).
 * - A declaration inside `declare global` declares or augments the global.
 * - With `topLevelIsGlobal`, so does a declaration at the top level.
 * - With `node`, an `infer` type parameter is only visible in its conditional
 *   type's true branch and in its own constraint.
 */
export function findShadowingVariable(
  name: string,
  scope: Scope.Scope,
  meaning: 'type' | 'value',
  options: ShadowLookupOptions = {},
): Scope.Variable | undefined {
  const { node } = options;

  for (
    let current: Scope.Scope | null = scope;
    current;
    current = current.upper
  ) {
    const variable = current.set.get(name);
    const definitions = node
      ? variable?.defs.filter(def => !isInferTypeParameterOutOfScope(def, node))
      : variable?.defs;
    if (!variable || !definitions?.length) {
      continue;
    }

    if (
      (current.block.type === AST_NODE_TYPES.TSModuleDeclaration &&
        current.block.kind === 'global') ||
      (options.topLevelIsGlobal && isTopLevelScope(current))
    ) {
      return undefined;
    }

    if (definitions.some(def => givesMeaning(def, meaning))) {
      return variable;
    }
  }

  return undefined;
}

export function isReferenceToGlobalFunction(
  calleeName: string,
  node: TSESTree.Node,
  sourceCode: SourceCode,
  options: GlobalLookupOptions = {},
): boolean {
  // The reference is not always in the scope of the node. For example, a
  // `switch` discriminant belongs to the switch scope but is referenced from
  // the scope that contains the `switch`.
  let ref: Scope.Reference | undefined;
  let scope: Scope.Scope | null = sourceCode.getScope(node);

  while (scope && !ref) {
    ref = scope.references.find(
      ref =>
        ref.identifier.name === calleeName &&
        ref.identifier.range[0] >= node.range[0] &&
        ref.identifier.range[1] <= node.range[1],
    );

    scope = scope.upper;
  }

  // The scope manager resolves the reference to the nearest variable of that
  // name that can be a type or a value, which may still not shadow the global
  if (!ref?.resolved) {
    return true;
  }

  return !findShadowingVariable(
    calleeName,
    ref.resolved.scope,
    ref.isValueReference ? 'value' : 'type',
    { ...options, node: ref.identifier },
  );
}
