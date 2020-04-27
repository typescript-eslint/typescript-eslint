import ESLintReference from 'eslint-scope/lib/reference';
import { TSESTree } from '../ts-estree';
import { Scope } from './Scope';
import { Variable } from './Variable';

export type ReferenceFlag = 0x1 | 0x2 | 0x3;

interface Reference {
  /**
   * The read-write mode of the reference. (Value is one of {@link Reference.READ}, {@link Reference.RW}, {@link Reference.WRITE}).
   */
  flag: ReferenceFlag;
  /**
   * Reference to the enclosing Scope.
   */
  from: Scope;
  identifier: TSESTree.Identifier;
  /**
   * Whether the Reference is to write of initialization.
   */
  init?: boolean;
  /**
   * Whether the Reference might refer to a partial value of writeExpr.
   */
  partial?: boolean;
  /**
   * The variable this reference is resolved with.
   */
  resolved: Variable | null;
  /**
   * Whether the reference comes from a dynamic scope (such as 'eval', 'with', etc.), and may be trapped by dynamic scopes.
   */
  tainted?: boolean;
  typeMode?: boolean;
  /**
   * If reference is writeable, this is the tree being written to it.
   */
  writeExpr?: TSESTree.Node | null;

  __maybeImplicitGlobal?: boolean;

  isWrite(): boolean;
  isRead(): boolean;
  isWriteOnly(): boolean;
  isReadOnly(): boolean;
  isReadWrite(): boolean;
}
interface ReferenceStatic {
  readonly READ: 0x1;
  readonly WRITE: 0x2;
  readonly RW: 0x3;
}
interface ReferenceConstructor {
  new (
    identifier: TSESTree.Identifier,
    scope: Scope,
    flag: ReferenceFlag,
    writeExpr?: TSESTree.Node | null,
    maybeImplicitGlobal?: boolean,
    partial?: boolean,
    init?: boolean,
  ): Reference;
}
const Reference = ESLintReference as ReferenceConstructor & ReferenceStatic;

export { Reference, ReferenceStatic };
