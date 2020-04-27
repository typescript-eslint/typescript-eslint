import {
  Definition as ESLintDefinition,
  ParameterDefinition as ESLintParameterDefinition,
} from 'eslint-scope/lib/definition';
import { TSESTree } from '../ts-estree';
import { VariableType } from './Variable';

interface Definition {
  /**
   * type of the occurrence (e.g. "Parameter", "Variable", ...).
   */
  type: VariableType;
  /**
   * the identifier AST node of the occurrence.
   */
  name: TSESTree.BindingName;
  /**
   * the enclosing node of the identifier.
   */
  node: TSESTree.Node;
  /**
   * the enclosing statement node of the identifier.
   */
  parent: TSESTree.Node | null;
  index: number | null;
  kind: string | null;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DefinitionStatic {}
interface DefinitionConstructor {
  new (
    type: VariableType,
    name: TSESTree.BindingName | TSESTree.PropertyName,
    node: TSESTree.Node,
    parent?: TSESTree.Node | null,
    index?: number | null,
    kind?: string | null,
  ): Definition;
}
const Definition = ESLintDefinition as DefinitionConstructor & DefinitionStatic;

interface ParameterDefinition extends Definition {
  parent: null;
  kind: null;

  /**
   * Whether the parameter definition is a part of a rest parameter.
   */
  rest?: boolean;
}
const ParameterDefinition = ESLintParameterDefinition as DefinitionConstructor & {
  new (
    name: TSESTree.Node,
    node: TSESTree.Node,
    index?: number | null,
    rest?: boolean,
  ): ParameterDefinition;
};

export { Definition, DefinitionStatic, ParameterDefinition };
