import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';
import type { Identifier } from '../../expression/Identifier/spec';
import type { BlockStatement } from '../../statement/BlockStatement/spec';

interface FunctionDeclarationBase extends FunctionBase {
  type: AST_NODE_TYPES.FunctionDeclaration;
  body: BlockStatement;
  declare: false;
  expression: false;
}

/**
 * A function expression that may or may not have a name.
 * Standalone function declarations do:
 * ```
 * function f() {}
 * ```
 * Default-exported function declarations have optional names:
 * ```
 * export default function () {}
 * ```
 */
export interface FunctionDeclaration extends FunctionDeclarationBase {
  id: Identifier | null;
}

/**
 * A function declaration that definitely has a name (is not anonymous):
 * ```
 * function f() {}
 * ```
 */
export interface FunctionDeclarationWithName extends FunctionDeclaration {
  id: Identifier;
}
