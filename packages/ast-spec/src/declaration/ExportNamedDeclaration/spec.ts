import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportSpecifier } from '../../special/ExportSpecifier/spec';
import type { ExportDeclaration } from '../../unions/ExportDeclaration';
import type { Literal } from '../../unions/Literal';
import type { ExportKind } from '../ExportAndImportKind';

export interface ExportNamedDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportNamedDeclaration;
  declaration: ExportDeclaration | null;
  specifiers: ExportSpecifier[];
  source: Literal | null;
  exportKind: ExportKind;
}
