import type { TSESTree } from '@typescript-eslint/types';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { simpleTraverse } from '@typescript-eslint/typescript-estree';

import { parseAndAnalyze } from '../test-utils/index.js';

describe('referencing a type - positive', () => {
  it('records a reference when a type is referenced from a type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl = string;
      type OtherType = TypeDecl;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSTypeAliasDeclaration](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    const referencingNode = nodes[1];

    assert.isNodeOfType(node, AST_NODE_TYPES.TSTypeAliasDeclaration);

    assert.isNodeOfType(referencingNode, AST_NODE_TYPES.TSTypeAliasDeclaration);

    expect(node.id.name).toBe('TypeDecl');

    expect(referencingNode.id.name).toBe('OtherType');

    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(1);

    expect(variable.references[0].identifier.parent.parent).toBe(
      referencingNode,
    );
  });

  it('records a reference when a dual value-type is referenced from a type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      class Class {}
      type Type = Class;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.ClassDeclaration](node) {
            nodes.push(node);
          },
          [AST_NODE_TYPES.TSTypeAliasDeclaration](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    const referencingNode = nodes[1];

    assert.isNodeOfType(node, AST_NODE_TYPES.ClassDeclaration);

    assert.isNodeOfType(referencingNode, AST_NODE_TYPES.TSTypeAliasDeclaration);

    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(1);

    expect(variable.references[0].identifier.parent.parent).toBe(
      referencingNode,
    );
  });

  it('records a reference when a generic type parameter is referenced from its type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl<TypeParam> = TypeParam;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSTypeParameter](node) {
            nodes.push(node);
          },
          [AST_NODE_TYPES.TSTypeReference](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    const referencingNode = nodes[1];

    assert.isNodeOfType(node, AST_NODE_TYPES.TSTypeParameter);

    assert.isNodeOfType(referencingNode, AST_NODE_TYPES.TSTypeReference);

    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(1);

    expect(variable.references[0].identifier.parent).toBe(referencingNode);
  });

  it('records references when a name has both a type and a variable definition', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      const dual = 1;
      type dual = number;

      type reference1 = dual;
      const reference2 = dual;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSTypeAliasDeclaration](node) {
            assert.isNodeOfType(node, AST_NODE_TYPES.TSTypeAliasDeclaration);

            if (node.id.name === 'reference1') {
              nodes.push(node);
            }
          },
          [AST_NODE_TYPES.VariableDeclarator](node) {
            assert.isNodeOfType(node, AST_NODE_TYPES.VariableDeclarator);

            assert.isNodeOfType(node.id, AST_NODE_TYPES.Identifier);

            if (node.id.name === 'dual' || node.id.name === 'reference2') {
              nodes.push(node);
            }
          },
        },
      },
      true,
    );

    const node = nodes[0];

    const referencingTypeNode = nodes[1];

    const referencingVariableNode = nodes[2];

    assert.isNodeOfType(node, AST_NODE_TYPES.VariableDeclarator);

    assert.isNodeOfType(
      referencingTypeNode,
      AST_NODE_TYPES.TSTypeAliasDeclaration,
    );

    assert.isNodeOfType(
      referencingVariableNode,
      AST_NODE_TYPES.VariableDeclarator,
    );

    assert.isNodeOfType(node.id, AST_NODE_TYPES.Identifier);

    assert.isNodeOfType(referencingVariableNode.id, AST_NODE_TYPES.Identifier);

    expect(node.id.name).toBe('dual');

    expect(referencingTypeNode.id.name).toBe('reference1');

    expect(referencingVariableNode.id.name).toBe('reference2');

    const variable = scopeManager.getDeclaredVariables(node)[0];

    // it should merge the defs into a single variable
    expect(variable.defs).toHaveLength(2);

    expect(variable.references).toHaveLength(3);

    // first ref is the definition of the variable
    expect(variable.references[0].identifier.parent).toBe(node);
    // second ref is the type reference
    expect(variable.references[1].identifier.parent.parent).toBe(
      referencingTypeNode,
    );
    // third ref is the variable reference
    expect(variable.references[2].identifier.parent).toBe(
      referencingVariableNode,
    );
  });

  it('records value and type references to imported variables', () => {
    const { ast, scopeManager } = parseAndAnalyze(
      `
        import { foo } from 'module';
        const test = foo;
        type Test = foo;
      `,
      'module',
    );

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.ImportSpecifier](node) {
            nodes.push(node);
          },
          [AST_NODE_TYPES.TSTypeReference](node) {
            nodes.push(node);
          },
          [AST_NODE_TYPES.VariableDeclarator](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    const variableDecl = nodes[1];

    const typeRef = nodes[2];

    assert.isNodeOfType(node, AST_NODE_TYPES.ImportSpecifier);

    assert.isNodeOfType(variableDecl, AST_NODE_TYPES.VariableDeclarator);

    assert.isNodeOfType(typeRef, AST_NODE_TYPES.TSTypeReference);

    const variable = scopeManager.getDeclaredVariables(node)[0];
    expect(variable.references).toHaveLength(2);
    // first reference is from the variable
    expect(variable.references[0].identifier.parent).toBe(variableDecl);
    // second reference is from the type
    expect(variable.references[1].identifier.parent).toBe(typeRef);
  });

  it('records a reference when a value is referenced from a typeof predicate', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      const value = 1;
      type Type = typeof value;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSTypeAliasDeclaration](node) {
            nodes.push(node);
          },
          [AST_NODE_TYPES.VariableDeclarator](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    const referencingNode = nodes[1];

    assert.isNodeOfType(node, AST_NODE_TYPES.VariableDeclarator);

    assert.isNodeOfType(referencingNode, AST_NODE_TYPES.TSTypeAliasDeclaration);

    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(2);
    // first ref is the definition of the variable
    expect(variable.references[0].identifier.parent).toBe(node);
    // second ref is the predicate reference
    expect(variable.references[1].identifier.parent.parent).toBe(
      referencingNode,
    );
  });

  it('records a reference to an outer namespace when shadowed by a generic in a qualified type name', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      namespace T {
        export type Foo = 1;
        export interface Bar {}
      }
      type Alias<T> = T.Foo;
      class Class<T> implements T.Bar {}
    `);

    const moduleDecls: TSESTree.Node[] = [];
    const typeParams: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSModuleDeclaration](node) {
            moduleDecls.push(node);
          },
          [AST_NODE_TYPES.TSTypeParameter](node) {
            typeParams.push(node);
          },
        },
      },
      true,
    );

    const namespaceVar = scopeManager.getDeclaredVariables(moduleDecls[0])[0];
    expect(namespaceVar.references).toHaveLength(2);
    expect(namespaceVar.references[0].isTypeQualifiedNameReference).toBe(true);
    expect(namespaceVar.references[1].isTypeQualifiedNameReference).toBe(true);

    expect(
      scopeManager.getDeclaredVariables(typeParams[0])[0].references,
    ).toHaveLength(0);
    expect(
      scopeManager.getDeclaredVariables(typeParams[1])[0].references,
    ).toHaveLength(0);
  });

  it('records a reference to an outer type when shadowed by an inner namespace in a non-qualified type reference', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type T = 1;
      namespace Outer {
        namespace T {
          export type Foo = 2;
        }
        export type Bar = T;
      }
    `);

    const typeDecls: TSESTree.Node[] = [];
    const moduleDecls: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSModuleDeclaration](node) {
            moduleDecls.push(node);
          },
          [AST_NODE_TYPES.TSTypeAliasDeclaration](node) {
            typeDecls.push(node);
          },
        },
      },
      true,
    );

    const outerTypeVar = scopeManager.getDeclaredVariables(typeDecls[0])[0];
    expect(outerTypeVar.references).toHaveLength(1);
    expect(outerTypeVar.references[0].isTypeQualifiedNameReference).toBe(false);

    const innerNamespaceVar = scopeManager.getDeclaredVariables(
      moduleDecls[1],
    )[0];
    expect(innerNamespaceVar.references).toHaveLength(0);
  });
});

describe('referencing a type - negative', () => {
  it('does not record a reference when a value is referenced from a type without a typeof predicate', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      const value = 1;
      type Type = value;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.VariableDeclarator](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    assert.isNodeOfType(node, AST_NODE_TYPES.VariableDeclarator);

    const variable = scopeManager.getDeclaredVariables(node)[0];

    // variables declare a reference to themselves if they have an initialization
    // so there should be one reference from the declaration itself
    expect(variable.references).toHaveLength(1);
    expect(variable.references[0].identifier.parent).toBe(node);
  });

  it('does not record a reference when a type is referenced from a value', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type Type = 1;
      const value = Type;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSTypeAliasDeclaration](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    assert.isNodeOfType(node, AST_NODE_TYPES.TSTypeAliasDeclaration);

    const variable = scopeManager.getDeclaredVariables(node)[0];
    expect(variable.references).toHaveLength(0);
  });

  it('does not record a reference when a type is referenced from outside its declaring type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl<TypeParam> = T;
      type Other = TypeParam;
    `);

    const nodes: TSESTree.Node[] = [];

    simpleTraverse(
      ast,
      {
        visitors: {
          [AST_NODE_TYPES.TSTypeParameter](node) {
            nodes.push(node);
          },
        },
      },
      true,
    );

    const node = nodes[0];

    assert.isNodeOfType(node, AST_NODE_TYPES.TSTypeParameter);

    const variable = scopeManager.getDeclaredVariables(node)[0];
    expect(variable.references).toHaveLength(0);
  });
});
