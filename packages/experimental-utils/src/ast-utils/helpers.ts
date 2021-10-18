import { AST_NODE_TYPES, TSESTree } from '../ts-estree';

export const isNodeOfType =
  <NodeType extends AST_NODE_TYPES>(nodeType: NodeType) =>
  (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeType } =>
    node?.type === nodeType;

export const isNodeOfTypes =
  <NodeTypes extends readonly AST_NODE_TYPES[]>(nodeTypes: NodeTypes) =>
  (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeTypes[number] } =>
    !!node && nodeTypes.includes(node.type);

type ObjectEntry<BaseType> = [keyof BaseType, BaseType[keyof BaseType]];
type ObjectEntries<BaseType> = Array<ObjectEntry<BaseType>>;
export const isNodeOfTypeWithConditions = <
  NodeType extends AST_NODE_TYPES,
  Conditions extends Partial<TSESTree.Node & { type: NodeType }>,
>(
  nodeType: NodeType,
  conditions: Conditions,
): ((
  node: TSESTree.Node | null | undefined,
) => node is TSESTree.Node & { type: NodeType } & Conditions) => {
  const entries = Object.entries(conditions) as ObjectEntries<
    TSESTree.Node & { type: NodeType }
  >;

  return (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeType } & Conditions =>
    node?.type === nodeType &&
    entries.every(([key, value]) => node[key] === value);
};
