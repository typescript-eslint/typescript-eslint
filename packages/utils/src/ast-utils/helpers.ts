import type { AST_NODE_TYPES, AST_TOKEN_TYPES, TSESTree } from '../ts-estree';

type ObjectEntry<BaseType> = BaseType extends unknown
  ? [keyof BaseType, BaseType[keyof BaseType]]
  : never;
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
  ): node is Extract<TSESTree.Node, { type: NodeTypes[number] }> =>
    !!node && nodeTypes.includes(node.type);

export const isNodeOfTypeWithConditions = <
  NodeType extends AST_NODE_TYPES,
  ExtractedNode extends Extract<TSESTree.Node, { type: NodeType }>,
  Conditions extends Partial<ExtractedNode>,
>(
  nodeType: NodeType,
  conditions: Conditions,
): ((
  node: TSESTree.Node | null | undefined,
) => node is ExtractedNode & Conditions) => {
  const entries = Object.entries(conditions) as ObjectEntries<TSESTree.Node>;

  return (
    node: TSESTree.Node | null | undefined,
  ): node is ExtractedNode & Conditions =>
    node?.type === nodeType &&
    entries.every(([key, value]) => node[key as keyof TSESTree.Node] === value);
};

export const isTokenOfTypeWithConditions = <
  TokenType extends AST_TOKEN_TYPES,
  ExtractedToken extends Extract<TSESTree.Token, { type: TokenType }>,
  Conditions extends Partial<TSESTree.Token & { type: TokenType }>,
>(
  tokenType: TokenType,
  conditions: Conditions,
): ((
  token: TSESTree.Token | null | undefined,
) => token is ExtractedToken & Conditions) => {
  const entries = Object.entries(conditions) as ObjectEntries<TSESTree.Token>;

  return (
    token: TSESTree.Token | null | undefined,
  ): token is ExtractedToken & Conditions =>
    token?.type === tokenType &&
    entries.every(
      ([key, value]) => token[key as keyof TSESTree.Token] === value,
    );
};

export const isNotTokenOfTypeWithConditions =
  <
    TokenType extends AST_TOKEN_TYPES,
    ExtractedToken extends Extract<TSESTree.Token, { type: TokenType }>,
    Conditions extends Partial<ExtractedToken>,
  >(
    tokenType: TokenType,
    conditions: Conditions,
  ): ((
    token: TSESTree.Token | null | undefined,
  ) => token is Exclude<TSESTree.Token, ExtractedToken & Conditions>) =>
  (token): token is Exclude<TSESTree.Token, ExtractedToken & Conditions> =>
    !isTokenOfTypeWithConditions(tokenType, conditions)(token);
