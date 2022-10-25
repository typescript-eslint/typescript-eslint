import type * as TSESTree from './generated/ast-spec';

// augment to add the parent property, which isn't part of the spec
declare module './generated/ast-spec' {
  interface BaseNode {
    parent?: TSESTree.Node;
  }

  // TODO - make this change as a breaking change
  /*
  interface BaseNode {
    parent: TSESTree.Node;
  }

  interface Program {
    parent?: undefined;
  }
  */
}

export * as TSESTree from './generated/ast-spec';
