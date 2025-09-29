import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { ClassBase } from '../../base/ClassBase';
import type { Identifier } from '../../expression/Identifier/spec';

interface ClassDeclarationBase extends ClassBase {
  type: AST_NODE_TYPES.ClassDeclaration;
}

/**
 * A normal class declaration:
 * ```
 * class A {}
 * ```
 */
export interface ClassDeclarationWithName extends ClassDeclarationBase {
  id: Identifier;
}

/**
 * Default-exported class declarations have optional names:
 * ```
 * export default class {}
 * ```
 */
export interface ClassDeclarationWithOptionalName extends ClassDeclarationBase {
  id: Identifier | null;
}

export type ClassDeclaration =
  | ClassDeclarationWithName
  | ClassDeclarationWithOptionalName;
