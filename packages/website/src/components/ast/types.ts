import type { TSESTree } from '@typescript-eslint/website-eslint';

export interface GenericParams<V> {
  readonly propName?: string;
  readonly name?: string;
  readonly value: V;
  readonly level: string;
  readonly selection?: TSESTree.Node | null;
  readonly onSelectNode: (node: TSESTree.Node | null) => void;
}
