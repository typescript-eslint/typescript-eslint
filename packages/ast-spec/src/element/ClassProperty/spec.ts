import type { AST_NODE_TYPES } from '../../ast-node-types';
import type {
  ClassPropertyComputedNameBase,
  ClassPropertyNonComputedNameBase,
} from '../../base/ClassPropertyBase';

export interface ClassPropertyComputedName
  extends ClassPropertyComputedNameBase {
  type: AST_NODE_TYPES.ClassProperty;
}

export interface ClassPropertyNonComputedName
  extends ClassPropertyNonComputedNameBase {
  type: AST_NODE_TYPES.ClassProperty;
}

export type ClassProperty =
  | ClassPropertyComputedName
  | ClassPropertyNonComputedName;
