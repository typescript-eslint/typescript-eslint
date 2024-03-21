import type { TSESTree } from '@typescript-eslint/types';

import { createIdGenerator } from '../ID';
import type { DefinitionType } from './DefinitionType';

const generator = createIdGenerator();

abstract class DefinitionBase<
  Type extends DefinitionType,
  Node extends TSESTree.Node,
  Parent extends TSESTree.Node | null,
  Name extends TSESTree.Node,
> {
  /**
   * A unique ID for this instance - primarily used to help debugging and testing
   */
  public readonly $id: number = generator();

  /**
   * The `Identifier` node of this definition
   * @public
   */
  public readonly name: Name;

  /**
   * The enclosing node of the name.
   * @public
   */
  public readonly node: Node;

  /**
   * the enclosing statement node of the identifier.
   * @public
   */
  public readonly parent: Parent;

  public readonly type: Type;

  constructor(type: Type, name: Name, node: Node, parent: Parent) {
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
