import type * as TSESTree from './generated/ast-spec';

// augment to add the parent property, which isn't part of the spec
declare module './generated/ast-spec' {
  interface BaseNode {
    parent: TSESTree.Node;
  }

  interface Program {
    /**
     * @remarks This never-used property exists only as a convenience for code that tries to access node parents repeatedly.
     */
    parent?: never;
  }
}

export * as TSESTree from './generated/ast-spec';
