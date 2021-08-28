import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  ClassPropertyComputedNameBase,
  ClassPropertyNonComputedNameBase,
} from '../../base/ClassPropertyBase';

export interface TSAbstractClassPropertyComputedName
  extends ClassPropertyComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractClassProperty;
  value: null;
}

export interface TSAbstractClassPropertyNonComputedName
  extends ClassPropertyNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractClassProperty;
  value: null;
}

export type TSAbstractClassProperty =
  | TSAbstractClassPropertyComputedName
  | TSAbstractClassPropertyNonComputedName;
