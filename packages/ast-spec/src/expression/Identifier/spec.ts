import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Decorator } from '../../special/Decorator/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';

export interface Identifier extends BaseNode {
  decorators: Decorator[];
  name: string;
  optional: boolean;
  type: AST_NODE_TYPES.Identifier;
  typeAnnotation: TSTypeAnnotation | undefined;
}
