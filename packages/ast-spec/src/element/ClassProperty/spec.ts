import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  ClassPropertyComputedNameBase,
  ClassPropertyNonComputedNameBase,
} from '../../base/ClassPropertyBase';
import type { Expression } from '../../unions/Expression';

export interface ClassPropertyComputedName
  extends ClassPropertyComputedNameBase {
  value: Expression | null;
  type: AST_NODE_TYPES.ClassProperty;
}

export interface ClassPropertyNonComputedName
  extends ClassPropertyNonComputedNameBase {
  value: Expression | null;
  type: AST_NODE_TYPES.ClassProperty;
}

export type ClassProperty =
  | ClassPropertyComputedName
  | ClassPropertyNonComputedName;
