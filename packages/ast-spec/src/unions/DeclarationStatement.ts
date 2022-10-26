import type { ClassDeclaration } from '../declaration/ClassDeclaration/spec';
import type { ExportAllDeclaration } from '../declaration/ExportAllDeclaration/spec';
import type { ExportDefaultDeclaration } from '../declaration/ExportDefaultDeclaration/spec';
import type { ExportNamedDeclaration } from '../declaration/ExportNamedDeclaration/spec';
import type { FunctionDeclaration } from '../declaration/FunctionDeclaration/spec';
import type { TSDeclareFunction } from '../declaration/TSDeclareFunction/spec';
import type { TSEnumDeclaration } from '../declaration/TSEnumDeclaration/spec';
import type { TSImportEqualsDeclaration } from '../declaration/TSImportEqualsDeclaration/spec';
import type { TSInterfaceDeclaration } from '../declaration/TSInterfaceDeclaration/spec';
import type { TSModuleDeclaration } from '../declaration/TSModuleDeclaration/spec';
import type { TSNamespaceExportDeclaration } from '../declaration/TSNamespaceExportDeclaration/spec';
import type { TSTypeAliasDeclaration } from '../declaration/TSTypeAliasDeclaration/spec';
import type { ClassExpression } from '../expression/ClassExpression/spec';

// TODO - breaking change remove this
export type DeclarationStatement =
  | ClassDeclaration
  | ClassExpression
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | FunctionDeclaration
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSNamespaceExportDeclaration
  | TSTypeAliasDeclaration;
