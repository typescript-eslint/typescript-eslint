import type { TSESTree, TSESTreeToTSNode, TSNode, TSToken } from './ts-estree';

// This lets us use generics to type the return value, and removes the need to
// handle the undefined type in the get method
export interface ParserWeakMap<Key, ValueBase> {
  // This is unsafe internally, so it should only be exposed via safe wrappers.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  get<Value extends ValueBase>(key: Key): Value;
  has(key: unknown): boolean;
}

export interface ParserWeakMapESTreeToTSNode<
  Key extends TSESTree.Node = TSESTree.Node,
> {
  get<KeyBase extends Key>(key: KeyBase): TSESTreeToTSNode<KeyBase>;
  has(key: unknown): boolean;
}

export interface ASTMaps {
  esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode, TSESTree.Node>;
}

export interface ParserServicesNodeMaps {
  esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode | TSToken, TSESTree.Node>;
}
