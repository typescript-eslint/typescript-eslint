import { TSESTree } from '@typescript-eslint/types';
import { createIdGenerator } from '../ID';
import { Scope } from '../scope';
import { Variable } from '../variable';

enum ReferenceFlag {
  Read = 0x1,
  Write = 0x2,
  ReadWrite = 0x3,
}

interface ReferenceImplicitGlobal {
  node: TSESTree.Node;
  pattern: TSESTree.BindingName;
  ref?: Reference;
}

const generator = createIdGenerator();

enum ReferenceTypeFlag {
  Value = 0x1,
  Type = 0x2,
}

/**
 * A Reference represents a single occurrence of an identifier in code.
 */
class Reference {
  /**
   * A unique ID for this instance - primarily used to help debugging and testing
   */
  public readonly $id: number = generator();
  /**
   * The read-write mode of the reference.
   */
  readonly #flag: ReferenceFlag;
  /**
   * Reference to the enclosing Scope.
   * @public
   */
  public readonly from: Scope;
  /**
   * Identifier syntax node.
   * @public
   */
  public readonly identifier: TSESTree.Identifier | TSESTree.JSXIdentifier;
  /**
   * `true` if this writing reference is a variable initializer or a default value.
   * @public
   */
  public readonly init?: boolean;
  /**
   * The {@link Variable} object that this reference refers to. If such variable was not defined, this is `null`.
   * @public
   */
  public resolved: Variable | null;
  /**
   * If reference is writeable, this is the node being written to it.
   * @public
   */
  public readonly writeExpr?: TSESTree.Node | null;

  public readonly maybeImplicitGlobal?: ReferenceImplicitGlobal | null;

  /**
   * In some cases, a reference may be a type, value or both a type and value reference.
   */
  readonly #referenceType: ReferenceTypeFlag;

  /**
   * True if this reference can reference types
   */
  public get isTypeReference(): boolean {
    return (this.#referenceType & ReferenceTypeFlag.Type) !== 0;
  }

  /**
   * True if this reference can reference values
   */
  public get isValueReference(): boolean {
    return (this.#referenceType & ReferenceTypeFlag.Value) !== 0;
  }

  constructor(
    identifier: TSESTree.Identifier | TSESTree.JSXIdentifier,
    scope: Scope,
    flag: ReferenceFlag,
    writeExpr?: TSESTree.Node | null,
    maybeImplicitGlobal?: ReferenceImplicitGlobal | null,
    init?: boolean,
    referenceType = ReferenceTypeFlag.Value,
  ) {
    this.identifier = identifier;
    this.from = scope;
    this.resolved = null;
    this.#flag = flag;

    if (this.isWrite()) {
      this.writeExpr = writeExpr;
      this.init = init;
    }

    this.maybeImplicitGlobal = maybeImplicitGlobal;
    this.#referenceType = referenceType;
  }

  /**
   * Whether the reference is writeable.
   * @public
   */
  public isWrite(): boolean {
    return !!(this.#flag & ReferenceFlag.Write);
  }

  /**
   * Whether the reference is readable.
   * @public
   */
  public isRead(): boolean {
    return !!(this.#flag & ReferenceFlag.Read);
  }

  /**
   * Whether the reference is read-only.
   * @public
   */
  public isReadOnly(): boolean {
    return this.#flag === ReferenceFlag.Read;
  }

  /**
   * Whether the reference is write-only.
   * @public
   */
  public isWriteOnly(): boolean {
    return this.#flag === ReferenceFlag.Write;
  }

  /**
   * Whether the reference is read-write.
   * @public
   */
  public isReadWrite(): boolean {
    return this.#flag === ReferenceFlag.ReadWrite;
  }
}

export { Reference, ReferenceFlag, ReferenceTypeFlag, ReferenceImplicitGlobal };
