import type {
  ClassDeclarationWithName,
  ClassDeclarationWithOptionalName,
} from '../declaration/ClassDeclaration/spec';
import type {
  FunctionDeclarationWithName,
  FunctionDeclarationWithOptionalName,
} from '../declaration/FunctionDeclaration/spec';
import type { TSDeclareFunction } from '../declaration/TSDeclareFunction/spec';
import type { TSEnumDeclaration } from '../declaration/TSEnumDeclaration/spec';
import type { TSImportEqualsDeclaration } from '../declaration/TSImportEqualsDeclaration/spec';
import type { TSInterfaceDeclaration } from '../declaration/TSInterfaceDeclaration/spec';
import type { TSModuleDeclaration } from '../declaration/TSModuleDeclaration/spec';
import type { TSTypeAliasDeclaration } from '../declaration/TSTypeAliasDeclaration/spec';
import type { VariableDeclaration } from '../declaration/VariableDeclaration/spec';
import type { Expression } from './Expression';

// TODO(#1852) - the following are disallowed syntactically, but allowed by TS error recovery:
// TSEnumDeclaration, TSModuleDeclaration, TSTypeAliasDeclaration, VariableDeclaration
export type DefaultExportDeclarations =
  | ClassDeclarationWithOptionalName
  | Expression
  | FunctionDeclarationWithName
  | FunctionDeclarationWithOptionalName
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSTypeAliasDeclaration
  | VariableDeclaration;

// TODO(#1852) - the following are disallowed syntactically, but allowed by TS error recovery:
// ClassDeclarationWithOptionalName, FunctionDeclarationWithOptionalName
export type NamedExportDeclarations =
  | ClassDeclarationWithName
  | ClassDeclarationWithOptionalName
  | FunctionDeclarationWithName
  | FunctionDeclarationWithOptionalName
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSTypeAliasDeclaration
  | VariableDeclaration;

// TODO - breaking change remove this in the next major
export type ExportDeclaration =
  | DefaultExportDeclarations
  | NamedExportDeclarations;
