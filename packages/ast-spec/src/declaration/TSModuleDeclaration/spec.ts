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
   * The body of the module.
   * This can only be `undefined` for the code `declare module 'mod';`
   */
  body?: TSModuleBlock;
  /**
   * Whether the module is `declare`d
   * @example
   * ```ts
   * declare namespace F {}
   * ```
   */
  declare: boolean;
  // TODO - remove this in the next major (we have `.kind` now)
  /**
   * Whether this is a global declaration
   * @example
   * ```ts
   * declare global {}
   * ```
   *
   * @deprecated Use {@link kind} instead
   */
  global: boolean;
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
   * The keyword used to define this module declaration
   * @example
   * ```ts
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
  body: TSModuleBlock;
  id: Identifier | TSQualifiedName;
  kind: 'namespace';
}

export interface TSModuleDeclarationGlobal extends TSModuleDeclarationBase {
  body: TSModuleBlock;
  /**
   * This will always be an Identifier with name `global`
   */
  id: Identifier;
  kind: 'global';
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
  body: TSModuleBlock;
  declare: false;
  id: StringLiteral;
  kind: 'module';
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
  body?: TSModuleBlock;
  declare: true;
  id: StringLiteral;
  kind: 'module';
}
/**
 * The legacy module declaration, replaced with namespace declarations.
 * ```
 * module A {}
 * ```
 */
export interface TSModuleDeclarationModuleWithIdentifierId
  extends TSModuleDeclarationModuleBase {
  // Maybe not worth fixing since it's legacy
  body: TSModuleBlock;
  id: Identifier;
  // TODO: we emit the wrong AST for `module A.B {}`
  // https://github.com/typescript-eslint/typescript-eslint/pull/6272 only fixed namespaces
  kind: 'module';
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
