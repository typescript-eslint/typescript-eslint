import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { Accessibility } from '../../base/Accessibility';
import type { BaseNode } from '../../base/BaseNode';
import type { Decorator } from '../../special/Decorator/spec';
import type { BindingName } from '../../unions/BindingName';
import type { AssignmentPattern } from '../AssignmentPattern/spec';
import type { RestElement } from '../RestElement/spec';

export interface TSParameterProperty extends BaseNode {
  type: AST_NODE_TYPES.TSParameterProperty;
  accessibility?: Accessibility;
  readonly?: boolean;
  static?: boolean;
  export?: boolean;
  parameter: AssignmentPattern | BindingName | RestElement;
  decorators?: Decorator[];
}
