import {
  Definition as ESLintDefinition,
  ParameterDefinition as ESLintParameterDefinition,
} from 'eslint-scope/lib/definition';
import { TSESTree } from '../ts-estree';

interface Definition {
  type: string;
  name: TSESTree.BindingName;
  node: TSESTree.Node;
  parent?: TSESTree.Node | null;
  index?: number | null;
  kind?: string | null;
  rest?: boolean;
}
interface DefinitionConstructor {
  new (
    type: string,
    name: TSESTree.BindingName | TSESTree.PropertyName,
    node: TSESTree.Node,
    parent?: TSESTree.Node | null,
    index?: number | null,
    kind?: string | null,
  ): Definition;
}
const Definition = ESLintDefinition as DefinitionConstructor;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ParameterDefinition extends Definition {}
const ParameterDefinition = ESLintParameterDefinition as DefinitionConstructor & {
  new (
    name: TSESTree.Node,
    node: TSESTree.Node,
    index?: number | null,
    rest?: boolean,
  ): ParameterDefinition;
};

export { Definition, ParameterDefinition };
