import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { TSModuleBlock } from '../../special/TSModuleBlock/spec';

export type TSModuleDeclarationKind = 'global' | 'module' | 'namespace';

/*
TODO(#4966) - we currently emit this due to bad parser handling of nested modules
namespace Foo.Bar {}
^^^^^^^^^^^^^^^^^^^^ TSModuleDeclaration
              ^^^^^^ TSModuleDeclaration
                  ^^ TSModuleBlock

This should instead emit a TSQualifiedName for the `id` and not emit an inner TSModuleDeclaration
*/
type ModuleBody_TODOFixThis = TSModuleBlock | TSModuleDeclaration;

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
  id: Identifier | StringLiteral;
  /**
   * The body of the module.
   * This can only be `undefined` for the code `declare module 'mod';`
   * This will be a `TSModuleDeclaration` if the name is "nested" (`Foo.Bar`).
   */
  body?: ModuleBody_TODOFixThis;
  /**
   * Whether this is a global declaration
   * ```
   * declare global {}
   * ```
   */
  // TODO - remove this in the next major (we have `.kind` now)
  global?: boolean;
  /**
   * Whether the module is `declare`d
   * ```
   * declare namespace F {}
   * ```
   */
  // TODO(#5020) - make this `false` if it is not `declare`d
  declare?: boolean;

  /**
   * The keyword used to define this module declaration
   * ```
   * namespace Foo {}
   * ^^^^^^^^^
   *
   * module 'foo' {}
   * ^^^^^^
   *
   * declare global {}
   *         ^^^^^^
   * ```
   */
  kind: TSModuleDeclarationKind;
}

export interface TSModuleDeclarationNamespace extends TSModuleDeclarationBase {
  kind: 'namespace';
  // namespaces cannot have literal IDs
  id: Identifier;
  // namespaces must always have a body
  body: ModuleBody_TODOFixThis;

  // TODO - remove this in the next major (we have `.kind` now)
  global?: undefined;
}

export interface TSModuleDeclarationGlobal extends TSModuleDeclarationBase {
  kind: 'global';
  // cannot have a nested namespace for global module augmentation
  // cannot have `declare global;`
  body: TSModuleBlock;
  // this will always be an Identifier with name `global`
  id: Identifier;

  // note - it's not syntactically required to have `declare`, but it semantically required

  // TODO - remove this in the next major (we have `.kind` now)
  global: true;
}

interface TSModuleDeclarationModuleBase extends TSModuleDeclarationBase {
  kind: 'module';

  // TODO - remove this in the next major (we have `.kind` now)
  global?: undefined;
}

export type TSModuleDeclarationModule =
  | TSModuleDeclarationModuleWithIdentifierId
  | TSModuleDeclarationModuleWithStringId;
export type TSModuleDeclarationModuleWithStringId =
  | TSModuleDeclarationModuleWithStringIdDeclared
  | TSModuleDeclarationModuleWithStringIdNotDeclared;
export interface TSModuleDeclarationModuleWithStringIdNotDeclared
  extends TSModuleDeclarationModuleBase {
  kind: 'module';
  id: StringLiteral;
  declare: false;
  // cannot have nested namespaces with a string ID, must have a body
  body: TSModuleBlock;
}
export interface TSModuleDeclarationModuleWithStringIdDeclared
  extends TSModuleDeclarationModuleBase {
  kind: 'module';
  id: StringLiteral;
  declare: true;
  // cannot have nested namespaces with a string ID, might not have a body
  body?: TSModuleBlock;
}
export interface TSModuleDeclarationModuleWithIdentifierId
  extends TSModuleDeclarationModuleBase {
  kind: 'module';
  id: Identifier;
  // modules with an Identifier must always have a body
  body: ModuleBody_TODOFixThis;
}

export type TSModuleDeclaration =
  | TSModuleDeclarationGlobal
  | TSModuleDeclarationModule
  | TSModuleDeclarationNamespace;
