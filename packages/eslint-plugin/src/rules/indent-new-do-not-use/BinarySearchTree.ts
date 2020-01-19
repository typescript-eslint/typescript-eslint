// The following code is adapted from the the code in eslint.
// License: https://github.com/eslint/eslint/blob/48700fc8408f394887cdedd071b22b757700fdcb/LICENSE

import { TSESTree } from '@typescript-eslint/experimental-utils';
import createTree from 'functional-red-black-tree';

export type TokenOrComment = TSESTree.Token | TSESTree.Comment;
export interface TreeValue {
  offset: number;
  from: TokenOrComment | null;
  force: boolean;
}

/**
 * A mutable balanced binary search tree that stores (key, value) pairs. The keys are numeric, and must be unique.
 * This is intended to be a generic wrapper around a balanced binary search tree library, so that the underlying implementation
 * can easily be swapped out.
 */
export class BinarySearchTree {
  private rbTree = createTree<TreeValue>();

  /**
   * Inserts an entry into the tree.
   */
  public insert(key: number, value: TreeValue): void {
    const iterator = this.rbTree.find(key);

    if (iterator.valid) {
      this.rbTree = iterator.update(value);
    } else {
      this.rbTree = this.rbTree.insert(key, value);
    }
  }

  /**
   * Finds the entry with the largest key less than or equal to the provided key
   * @returns The found entry, or null if no such entry exists.
   */
  public findLe(key: number): { key: number; value: TreeValue } {
    const iterator = this.rbTree.le(key);

    return { key: iterator.key, value: iterator.value };
  }

  /**
   * Deletes all of the keys in the interval [start, end)
   */
  public deleteRange(start: number, end: number): void {
    // Exit without traversing the tree if the range has zero size.
    if (start === end) {
      return;
    }
    const iterator = this.rbTree.ge(start);

    while (iterator.valid && iterator.key < end) {
      this.rbTree = this.rbTree.remove(iterator.key);
      iterator.next();
    }
  }
}
