import type { TSESTree } from '@typescript-eslint/types';

import type { DefinitionType } from './DefinitionType';

import { createIdGenerator } from '../ID';

const generator = createIdGenerator();
/**
 * Helper type to exclude Program from valid definition nodes
 * Program is the root node and doesn't have a parent property
 */
export type NodeWithParent = Exclude<TSESTree.Node, TSESTree.Program>;

export abstract class DefinitionBase<
  Type extends DefinitionType,
  Node extends NodeWithParent,
  Parent extends TSESTree.Node | null,
  Name extends TSESTree.Node,
> {
  /**
   * A unique ID for this instance - primarily used to help debugging and testing
   */
  public readonly $id: number = generator();

  public readonly type: Type;

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
