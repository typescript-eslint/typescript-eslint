import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { ExportSpecifier } from '../../special/ExportSpecifier/spec';
import type { ImportAttribute } from '../../special/ImportAttribute/spec';
import type { ExportDeclaration } from '../../unions/ExportDeclaration';
import type { ExportKind } from '../ExportAndImportKind';

export interface ExportNamedDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportNamedDeclaration;
  // TODO(error handling) - ClassExpression is not valid here
  declaration: ExportDeclaration | null;
  specifiers: ExportSpecifier[];
  source: StringLiteral | null;
  exportKind: ExportKind;
  assertions: ImportAttribute[];
}
