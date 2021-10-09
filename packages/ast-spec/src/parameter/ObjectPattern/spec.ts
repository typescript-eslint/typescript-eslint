import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Property } from '../../element/Property/spec';
import type { Decorator } from '../../special/Decorator/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { RestElement } from '../RestElement/spec';

export interface ObjectPattern extends BaseNode {
  type: AST_NODE_TYPES.ObjectPattern;
  properties: (Property | RestElement)[];
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
  decorators?: Decorator[];
}
