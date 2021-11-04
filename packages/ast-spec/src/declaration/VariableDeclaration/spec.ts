import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { VariableDeclarator } from '../../special/VariableDeclarator/spec';

export interface VariableDeclaration extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  // NOTE - this is not guaranteed to have any elements in it. i.e. `const;`
  declarations: VariableDeclarator[];
  kind: 'const' | 'let' | 'var';
  declare?: boolean;
}
