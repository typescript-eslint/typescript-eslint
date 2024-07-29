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

  interface AccessorPropertyComputedName {
    parent: TSESTree.ClassBody;
  }

  interface AccessorPropertyNonComputedName {
    parent: TSESTree.ClassBody;
  }

  interface VariableDeclaratorDefiniteAssignment {
    parent: TSESTree.VariableDeclaration;
  }

  interface VariableDeclaratorMaybeInit {
    parent: TSESTree.VariableDeclaration;
  }

  interface VariableDeclaratorNoInit {
    parent: TSESTree.VariableDeclaration;
  }

  interface UsingInForOfDeclarator {
    parent: TSESTree.VariableDeclaration;
  }

  interface UsingInNormalContextDeclarator {
    parent: TSESTree.VariableDeclaration;
  }
}

export * as TSESTree from './generated/ast-spec';
