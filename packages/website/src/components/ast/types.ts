import type { TSESTree } from '@typescript-eslint/website-eslint';

export interface Position {
  line: number;
  column: number;
}

export interface GenericParams<V> {
  readonly propName?: string;
  readonly name?: string;
  readonly value: V;
  readonly level: string;
  readonly selection?: Position | null;
  readonly onSelectNode: (node: TSESTree.Node | null) => void;
}
