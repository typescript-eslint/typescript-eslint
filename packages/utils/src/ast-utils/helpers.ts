import { AST_NODE_TYPES, AST_TOKEN_TYPES, TSESTree } from '../ts-estree';

type ObjectEntry<BaseType> = [keyof BaseType, BaseType[keyof BaseType]];
type ObjectEntries<BaseType> = Array<ObjectEntry<BaseType>>;

export const isNodeOfType =
  <NodeType extends AST_NODE_TYPES>(nodeType: NodeType) =>
  (
    node: TSESTree.Node | null | undefined,
  ): node is Extract<TSESTree.Node, { type: NodeType }> =>
    node?.type === nodeType;

export const isNodeOfTypes =
  <NodeTypes extends readonly AST_NODE_TYPES[]>(nodeTypes: NodeTypes) =>
  (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeTypes[number] } =>
    !!node && nodeTypes.includes(node.type);

export const isNodeOfTypeWithConditions = <
  NodeType extends AST_NODE_TYPES,
  Conditions extends Partial<TSESTree.Node & { type: NodeType }>,
>(
  nodeType: NodeType,
  conditions: Conditions,
): ((
  node: TSESTree.Node | null | undefined,
) => node is TSESTree.Node & { type: NodeType } & Conditions) => {
  const entries = Object.entries(conditions) as ObjectEntries<TSESTree.Node>;

  return (
    node: TSESTree.Node | null | undefined,
  ): node is TSESTree.Node & { type: NodeType } & Conditions =>
    node?.type === nodeType &&
    entries.every(([key, value]) => node[key] === value);
};

export const isTokenOfTypeWithConditions = <
  TokenType extends AST_TOKEN_TYPES,
  Conditions extends Partial<TSESTree.Token & { type: TokenType }>,
>(
  tokenType: TokenType,
  conditions: Conditions,
): ((
  token: TSESTree.Token | null | undefined,
) => token is TSESTree.Token & { type: TokenType } & Conditions) => {
  const entries = Object.entries(conditions) as ObjectEntries<TSESTree.Token>;

  return (
    token: TSESTree.Token | null | undefined,
  ): token is TSESTree.Token & { type: TokenType } & Conditions =>
    token?.type === tokenType &&
    entries.every(([key, value]) => token[key] === value);
};

export const isNotTokenOfTypeWithConditions =
  <
    TokenType extends AST_TOKEN_TYPES,
    Conditions extends Partial<TSESTree.Token & { type: TokenType }>,
  >(
    tokenType: TokenType,
    conditions: Conditions,
  ): ((
    token: TSESTree.Token | null | undefined,
  ) => token is Exclude<
    TSESTree.Token,
    TSESTree.Token & { type: TokenType } & Conditions
  >) =>
  (
    token,
  ): token is Exclude<
    TSESTree.Token,
    TSESTree.Token & { type: TokenType } & Conditions
  > =>
    !isTokenOfTypeWithConditions(tokenType, conditions)(token);
