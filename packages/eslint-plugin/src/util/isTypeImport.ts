import type {
  Definition,
  ImportBindingDefinition,
} from '@typescript-eslint/scope-manager';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

/**
 * Determine whether a variable definition is a type import. e.g.:
 *
 * ```ts
 * import type { Foo } from 'foo';
 * import { type Bar } from 'bar';
 * ```
 *
 * @param definition - The variable definition to check.
 */
export function isTypeImport(
  definition?: Definition,
): definition is ImportBindingDefinition {
  return (
    definition?.type === DefinitionType.ImportBinding &&
    (definition.parent.importKind === 'type' ||
      (definition.node.type === AST_NODE_TYPES.ImportSpecifier &&
        definition.node.importKind === 'type'))
  );
}
