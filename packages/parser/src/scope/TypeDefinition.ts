import { TSESLintScope } from '@typescript-eslint/experimental-utils';
import { TSESTree } from '@typescript-eslint/typescript-estree';

/**
 * @class ParameterDefinition
 */
export class TypeDefinition extends TSESLintScope.Definition {
  /**
   * Whether the parameter definition is a type definition.
   * @member {boolean} ParameterDefinition#typeMode
   */
  typeMode: boolean;

  constructor(
    type: string,
    name: TSESTree.BindingName | TSESTree.PropertyName,
    node: TSESTree.Node,
    parent?: TSESTree.Node | null,
    index?: number | null,
    kind?: string | null,
  ) {
    super(type, name, node, parent, index, kind);

    this.typeMode = true;
  }
}
