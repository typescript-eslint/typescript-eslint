import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { TSModuleBlock } from '../../special/TSModuleBlock/spec';
import type { TSQualifiedName } from '../../type/spec';
import type { Literal } from '../../unions/Literal';

export type TSModuleDeclarationKind = 'global' | 'module' | 'namespace';

interface TSModuleDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.TSModuleDeclaration;
  /**
   * The name of the module
   * ```
   * namespace A {}
   * namespace A.B.C {}
   * module 'a' {}
   * ```
   */
  id: Identifier | Literal | TSQualifiedName;
  /**
   * The body of the module.
   * This can only be `undefined` for the code `declare module 'mod';`
   */
  body?: TSModuleBlock;
  /**
   * Whether this is a global declaration
   *
   * @deprecated Use {@link kind} instead
   */
  // TODO - remove this in the next major (we have `.kind` now)
  global: boolean;
  /**
   * Whether the module is `declare`d
   * ```
   * declare namespace F {}
   * ```
   */
  declare: boolean;

  /**
   * The keyword used to define this module declaration
   * ```
   * namespace Foo {}
   * ^^^^^^^^^
   *
   * module 'foo' {}
   * ^^^^^^
   *
   * global {}
   * ^^^^^^
   * ```
   */
  kind: TSModuleDeclarationKind;
}

export interface TSModuleDeclarationNamespace extends TSModuleDeclarationBase {
  kind: 'namespace';
  id: Identifier | TSQualifiedName;
  body: TSModuleBlock;
}

export interface TSModuleDeclarationGlobal extends TSModuleDeclarationBase {
  kind: 'global';
  /**
   * This will always be an Identifier with name `global`
   */
  id: Identifier;
  body: TSModuleBlock;
}

interface TSModuleDeclarationModuleBase extends TSModuleDeclarationBase {
  kind: 'module';
}

/**
 * A string module declaration that is not declared:
 * ```
 * module 'foo' {}
 * ```
 */
export interface TSModuleDeclarationModuleWithStringIdNotDeclared
  extends TSModuleDeclarationModuleBase {
  kind: 'module';
  id: StringLiteral;
  declare: false;
  body: TSModuleBlock;
}
/**
 * A string module declaration that is declared:
 * ```
 * declare module 'foo' {}
 * declare module 'foo';
 * ```
 */
export interface TSModuleDeclarationModuleWithStringIdDeclared
  extends TSModuleDeclarationModuleBase {
  kind: 'module';
  id: StringLiteral;
  declare: true;
  body?: TSModuleBlock;
}
/**
 * The legacy module declaration, replaced with namespace declarations.
 * ```
 * module A {}
 * ```
 */
export interface TSModuleDeclarationModuleWithIdentifierId
  extends TSModuleDeclarationModuleBase {
  kind: 'module';
  id: Identifier;
  // TODO: we emit the wrong AST for `module A.B {}`
  // https://github.com/typescript-eslint/typescript-eslint/pull/6272 only fixed namespaces
  // Maybe not worth fixing since it's legacy
  body: TSModuleBlock;
}

export type TSModuleDeclarationModuleWithStringId =
  | TSModuleDeclarationModuleWithStringIdDeclared
  | TSModuleDeclarationModuleWithStringIdNotDeclared;
export type TSModuleDeclarationModule =
  | TSModuleDeclarationModuleWithIdentifierId
  | TSModuleDeclarationModuleWithStringId;
export type TSModuleDeclaration =
  | TSModuleDeclarationGlobal
  | TSModuleDeclarationModule
  | TSModuleDeclarationNamespace;
