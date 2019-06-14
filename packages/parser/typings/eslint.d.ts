declare module 'eslint/lib/shared/traverser' {
  import { TSESTree } from '@typescript-eslint/experimental-utils';
  const traverser: {
    traverse(
      node: TSESTree.Node,
      options: {
        enter?: (node: TSESTree.Node, parent: TSESTree.Node) => void;
        leave?: (node: TSESTree.Node, parent: TSESTree.Node) => void;
        visitorKeys?: Record<string, string[]>;
      },
    ): void;
  };
  export = traverser;
}
