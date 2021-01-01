import * as TSESTree from '@typescript-eslint/ast-spec/dist/spec';

declare module '@typescript-eslint/ast-spec/dist/spec' {
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

export * as TSESTree from '@typescript-eslint/ast-spec/dist/spec';
