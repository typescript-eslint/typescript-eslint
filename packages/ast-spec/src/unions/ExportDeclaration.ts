import type { ClassDeclaration } from '../declaration/ClassDeclaration/spec';
import type { FunctionDeclaration } from '../declaration/FunctionDeclaration/spec';
import type { TSDeclareFunction } from '../declaration/TSDeclareFunction/spec';
import type { TSEnumDeclaration } from '../declaration/TSEnumDeclaration/spec';
import type { TSInterfaceDeclaration } from '../declaration/TSInterfaceDeclaration/spec';
import type { TSModuleDeclaration } from '../declaration/TSModuleDeclaration/spec';
import type { TSTypeAliasDeclaration } from '../declaration/TSTypeAliasDeclaration/spec';
import type { VariableDeclaration } from '../declaration/VariableDeclaration/spec';
import type { ClassExpression } from '../expression/ClassExpression/spec';

export type ExportDeclaration =
  | ClassDeclaration
  | ClassExpression
  | FunctionDeclaration
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSTypeAliasDeclaration
  | VariableDeclaration;
