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
import type { VariableDeclaration } from '../declaration/VariableDeclaration/spec';
import type { BlockStatement } from '../statement/BlockStatement/spec';
import type { BreakStatement } from '../statement/BreakStatement/spec';
import type { ContinueStatement } from '../statement/ContinueStatement/spec';
import type { DebuggerStatement } from '../statement/DebuggerStatement/spec';
import type { DoWhileStatement } from '../statement/DoWhileStatement/spec';
import type { ExpressionStatement } from '../statement/ExpressionStatement/spec';
import type { ForInStatement } from '../statement/ForInStatement/spec';
import type { ForOfStatement } from '../statement/ForOfStatement/spec';
import type { ForStatement } from '../statement/ForStatement/spec';
import type { IfStatement } from '../statement/IfStatement/spec';
import type { ImportDeclaration } from '../statement/ImportDeclaration/spec';
import type { LabeledStatement } from '../statement/LabeledStatement/spec';
import type { ReturnStatement } from '../statement/ReturnStatement/spec';
import type { SwitchStatement } from '../statement/SwitchStatement/spec';
import type { ThrowStatement } from '../statement/ThrowStatement/spec';
import type { TryStatement } from '../statement/TryStatement/spec';
import type { TSExportAssignment } from '../statement/TSExportAssignment/spec';
import type { WhileStatement } from '../statement/WhileStatement/spec';
import type { WithStatement } from '../statement/WithStatement/spec';

export type Statement =
  | BlockStatement
  | BreakStatement
  | ClassDeclaration
  | ContinueStatement
  | DebuggerStatement
  | DoWhileStatement
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclaration
  | IfStatement
  | ImportDeclaration
  | LabeledStatement
  | ReturnStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSExportAssignment
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSNamespaceExportDeclaration
  | TSTypeAliasDeclaration
  | VariableDeclaration
  | WhileStatement
  | WithStatement;

// These nodes are ***only*** allowed at the top-level
export type ProgramStatement =
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ImportDeclaration
  | Statement
  | TSImportEqualsDeclaration
  | TSNamespaceExportDeclaration;

// TODO - once we have syntax errors, the types in ProgramStatement should not be in Statement
