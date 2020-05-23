import { TSESTree } from '@typescript-eslint/types';
import { DefinitionType } from './DefinitionType';
import { createIdGenerator } from '../ID';

const generator = createIdGenerator();

abstract class DefinitionBase<
  TType extends DefinitionType,
  TNode extends TSESTree.Node,
  TParent extends TSESTree.Node | null,
  TName extends TSESTree.Node = TSESTree.BindingName
> {
  /**
   * A unique ID for this instance - primarily used to help debugging and testing
   */
  public readonly $id: number = generator();

  /**
   * The type of the definition
   * @public
   */
  public readonly type: TType;

  /**
   * The `Identifier` node of this definition
   * @public
   */
  public readonly name: TName;

  /**
   * The enclosing node of the name.
   * @public
   */
  public readonly node: TNode;

  /**
   * the enclosing statement node of the identifier.
   * @public
   */
  public readonly parent: TParent;

  constructor(type: TType, name: TName, node: TNode, parent: TParent) {
    this.type = type;
    this.name = name;
    this.node = node;
    this.parent = parent;
  }

  /**
   * `true` if the variable is valid in a type context, false otherwise
   */
  public abstract readonly isTypeDefinition: boolean;

  /**
   * `true` if the variable is valid in a value context, false otherwise
   */
  public abstract readonly isVariableDefinition: boolean;
}

export { DefinitionBase };
