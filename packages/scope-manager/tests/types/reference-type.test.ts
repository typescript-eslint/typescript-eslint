import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { getSpecificNode, parseAndAnalyze } from '../util';

describe('referencing a type - positive', () => {
  it('records a reference when a type is referenced from a type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl = string;
      type OtherType = TypeDecl;
    `);
    const node = getSpecificNode(
      ast,
      AST_NODE_TYPES.TSTypeAliasDeclaration,
      n => n.id.name === 'TypeDecl',
    );
    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(1);
    const referencingNode = getSpecificNode(
      ast,
      AST_NODE_TYPES.TSTypeAliasDeclaration,
      n => n.id.name === 'OtherType',
    );
    expect(variable.references[0].identifier.parent?.parent).toBe(
      referencingNode,
    );
  });

  it('records a reference when a dual value-type is referenced from a type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      class Class {}
      type Type = Class;
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.ClassDeclaration);
    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(1);
    const referencingNode = getSpecificNode(
      ast,
      AST_NODE_TYPES.TSTypeAliasDeclaration,
    );
    expect(variable.references[0].identifier.parent?.parent).toBe(
      referencingNode,
    );
  });

  it('records a reference when a generic type parameter is referenced from its type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl<TypeParam> = TypeParam;
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.TSTypeParameter);
    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(1);
    const referencingNode = getSpecificNode(
      ast,
      AST_NODE_TYPES.TSTypeReference,
    );
    expect(variable.references[0].identifier.parent).toBe(referencingNode);
  });

  it('records references when a name has both a type and a variable definition', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      const dual = 1;
      type dual = number;

      type reference1 = dual;
      const reference2 = dual;
    `);
    const node = getSpecificNode(
      ast,
      AST_NODE_TYPES.VariableDeclarator,
      n => n.id.type === AST_NODE_TYPES.Identifier && n.id.name === 'dual',
    );
    const variable = scopeManager.getDeclaredVariables(node)[0];

    // it should merge the defs into a single variable
    expect(variable.defs).toHaveLength(2);

    expect(variable.references).toHaveLength(3);

    // first ref is the definition of the variable
    expect(variable.references[0].identifier.parent).toBe(node);
    // second ref is the type reference
    const referencingTypeNode = getSpecificNode(
      ast,
      AST_NODE_TYPES.TSTypeAliasDeclaration,
      n => n.id.name === 'reference1',
    );
    expect(variable.references[1].identifier.parent?.parent).toBe(
      referencingTypeNode,
    );
    // third ref is the variable reference
    const referencingVariableNode = getSpecificNode(
      ast,
      AST_NODE_TYPES.VariableDeclarator,
      n =>
        n.id.type === AST_NODE_TYPES.Identifier && n.id.name === 'reference2',
    );
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
    const node = getSpecificNode(ast, AST_NODE_TYPES.ImportSpecifier);
    const variable = scopeManager.getDeclaredVariables(node)[0];
    expect(variable.references).toHaveLength(2);
    // first reference is from the variable
    const variableDecl = getSpecificNode(
      ast,
      AST_NODE_TYPES.VariableDeclarator,
    );
    expect(variable.references[0].identifier.parent).toBe(variableDecl);
    // second reference is from the type
    const typeRef = getSpecificNode(ast, AST_NODE_TYPES.TSTypeReference);
    expect(variable.references[1].identifier.parent).toBe(typeRef);
  });

  it('records a reference when a value is referenced from a typeof predicate', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      const value = 1;
      type Type = typeof value;
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.VariableDeclarator);
    const variable = scopeManager.getDeclaredVariables(node)[0];

    expect(variable.references).toHaveLength(2);
    // first ref is the definition of the variable
    expect(variable.references[0].identifier.parent).toBe(node);
    // second ref is the predicate reference
    const referencingNode = getSpecificNode(
      ast,
      AST_NODE_TYPES.TSTypeAliasDeclaration,
    );
    expect(variable.references[1].identifier.parent?.parent).toBe(
      referencingNode,
    );
  });
});

describe('referencing a type - negative', () => {
  it('does not record a reference when a value is referenced from a type without a typeof predicate', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      const value = 1;
      type Type = value;
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.VariableDeclarator);
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
    const node = getSpecificNode(ast, AST_NODE_TYPES.TSTypeAliasDeclaration);
    const variable = scopeManager.getDeclaredVariables(node)[0];
    expect(variable.references).toHaveLength(0);
  });

  it('does not record a reference when a type is referenced from outside its declaring type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl<TypeParam> = T;
      type Other = TypeParam;
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.TSTypeParameter);
    const variable = scopeManager.getDeclaredVariables(node)[0];
    expect(variable.references).toHaveLength(0);
  });

  it('does not record a reference when a type import is referenced from a value', () => {
    const { ast, scopeManager } = parseAndAnalyze(
      `
        import type { foo } from 'module';
        const test = foo;
      `,
      'module',
    );
    const node = getSpecificNode(ast, AST_NODE_TYPES.ImportSpecifier);
    const variable = scopeManager.getDeclaredVariables(node)[0];
    expect(variable.references).toHaveLength(0);
  });
});
