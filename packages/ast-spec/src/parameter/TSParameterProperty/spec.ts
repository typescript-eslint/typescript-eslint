import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { Accessibility } from '../../base/Accessibility';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { Decorator } from '../../special/Decorator/spec';
import type { AssignmentPattern } from '../AssignmentPattern/spec';

type ParameterPropertyParameter =
  | (AssignmentPattern & { left: Identifier })
  | Identifier;

export interface TSParameterProperty extends BaseNode {
  type: AST_NODE_TYPES.TSParameterProperty;
  accessibility: Accessibility | undefined;
  decorators: Decorator[];
  override: boolean;
  parameter: ParameterPropertyParameter;
  readonly: boolean;
  static: boolean;
}
