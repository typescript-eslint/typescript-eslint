import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { ClassBase } from '../../base/ClassBase';
import type { Identifier } from '../../expression/Identifier/spec';

interface ClassDeclarationBase extends ClassBase {
  type: AST_NODE_TYPES.ClassDeclaration;
}

/**
 * A class declaration that may or may not have a name.
 * Standalone class declarations do:
 * ```
 * class A {}
 * ```
 * Default-exported class declarations may have optional names:
 * ```
 * export default class {}
 * ```
 */
export interface ClassDeclaration extends ClassDeclarationBase {
  id: Identifier | null;
}

/**
 * A class declaration that definitely has a name (is not anonymous):
 * ```
 * class A {}
 * ```
 */
export interface ClassDeclarationWithName extends ClassDeclaration {
  id: Identifier;
}
