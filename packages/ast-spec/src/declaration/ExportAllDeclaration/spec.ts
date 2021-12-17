import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { ImportAttribute } from '../../special/ImportAttribute/spec';
import type { ExportKind } from '../ExportAndImportKind';

export interface ExportAllDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportAllDeclaration;
  source: StringLiteral | null;
  exportKind: ExportKind;
  exported: Identifier | null;
  assertions: ImportAttribute[];
}
