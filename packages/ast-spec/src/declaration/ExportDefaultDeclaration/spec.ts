import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportDeclaration } from '../../unions/ExportDeclaration';
import type { Expression } from '../../unions/Expression';
import type { ExportKind } from '../ExportAndImportKind';

export interface ExportDefaultDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportDefaultDeclaration;
  declaration:
    | // TODO(error handling) - the following are disallowed syntactically, but allowed by TS error recovery:
    // TSEnumDeclaration, TSModuleDeclaration, TSTypeAliasDeclaration, VariableDeclaration
    ExportDeclaration
    | Expression;
  exportKind: ExportKind;
}
