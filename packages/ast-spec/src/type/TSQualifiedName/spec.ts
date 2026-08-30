import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { EntityName } from '../../unions/EntityName';
import type { TSImportType } from '../TSImportType/spec';

export interface TSQualifiedName extends BaseNode {
  type: AST_NODE_TYPES.TSQualifiedName;
  left: EntityName | TSImportType;
  right: Identifier;
}
