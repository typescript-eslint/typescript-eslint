import type { TSESTree } from '@typescript-eslint/website-eslint';

export interface GenericParams<V> {
  propName?: string;
  name?: string;
  value: V;
  level: string;
  selection?: TSESTree.Node | null;
  onSelectNode: (node: TSESTree.Node | null) => void;
}
