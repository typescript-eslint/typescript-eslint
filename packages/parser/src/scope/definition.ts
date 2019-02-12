import { Definition, ParameterDefinition } from 'eslint-scope/lib/definition';
import { TSESTree } from '@typescript-eslint/typescript-estree';

/**
 * @class ParameterDefinition
 */
export class TypeDefinition extends Definition {
  /**
   * Whether the parameter definition is a type definition.
   * @member {boolean} ParameterDefinition#typeMode
   */
  typeMode: boolean;

  constructor(
    type: string,
    name: TSESTree.Node,
    node: TSESTree.Node,
    parent?: TSESTree.Node | null,
    index?: number | null,
    kind?: string | null
  ) {
    super(type, name, node, parent, index, kind);

    this.typeMode = true;
  }
}

export { ParameterDefinition, Definition };
