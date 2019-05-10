declare module 'functional-red-black-tree' {
  class RBNode<TValue, TKey = number> {
    public readonly key: TKey;
    public readonly left: RBNode<TValue, TKey>;
    public readonly right: RBNode<TValue, TKey>;
    public readonly value: TValue;
  }

  class RedBlackTreeIterator<TValue, TKey = number> {
    public readonly hasNext: boolean;
    public readonly hasPrev: boolean;
    public readonly index: number;
    public readonly key: TKey;
    public readonly node: RBNode<TValue, TKey> | null;
    public readonly tree: RBTree<TValue, TKey>;
    public readonly valid: boolean;
    public readonly value: TValue;

    public clone(): RedBlackTreeIterator<TValue, TKey>;
    public remove(): RBTree<TValue, TKey>;
    public update(value: TValue): RBTree<TValue, TKey>;
    public next(): void;
    public prev(): void;
  }

  class RBTree<TValue, TKey = number> {
    public begin: RedBlackTreeIterator<TValue, TKey>;
    public end: RedBlackTreeIterator<TValue, TKey>;
    public readonly keys: TKey[];
    public readonly length: number;
    public root: RBNode<TValue, TKey> | null;
    public readonly values: TValue[];

    public get(key: TKey): TValue;
    public insert(key: TKey, value: TValue): RBTree<TValue, TKey>;
    public remove(key: TKey): this;
    public find(key: TKey): RedBlackTreeIterator<TValue, TKey>;
    public forEach(
      visitor: (key: TKey, value: TValue) => void,
      low: TKey,
      high: TKey,
    ): void;

    public ge(key: TKey): RedBlackTreeIterator<TValue, TKey>;
    public gt(key: TKey): RedBlackTreeIterator<TValue, TKey>;
    public le(key: TKey): RedBlackTreeIterator<TValue, TKey>;
    public lt(key: TKey): RedBlackTreeIterator<TValue, TKey>;
    public at(position: number): RedBlackTreeIterator<TValue, TKey>;
  }

  function createRBTree<TValue, TKey = number>(
    compare?: (a: TKey, b: TKey) => number,
  ): RBTree<TValue, TKey>;
  export = createRBTree;
}
