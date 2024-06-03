import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';

interface TSDeclareFunctionBase extends FunctionBase {
  type: AST_NODE_TYPES.TSDeclareFunction;
  /**
   * TS1183: An implementation cannot be declared in ambient contexts.
   */
  body: undefined;
  /**
   * Whether the declaration has `declare` modifier.
   */
  declare: boolean;
  expression: false;
}

export interface TSDeclareFunctionWithDeclare extends TSDeclareFunctionBase {
  /**
   * TS1040: 'async' modifier cannot be used in an ambient context.
   */
  async: false;
  declare: true;
  /**
   * TS1221: Generators are not allowed in an ambient context.
   */
  generator: false;
}

export interface TSDeclareFunctionNoDeclare extends TSDeclareFunctionBase {
  declare: false;
}

export type TSDeclareFunction =
  | TSDeclareFunctionWithDeclare
  | TSDeclareFunctionNoDeclare;
