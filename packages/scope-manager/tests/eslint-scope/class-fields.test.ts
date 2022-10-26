import {
  expectToBeClassFieldInitializerScope,
  expectToBeClassScope,
  expectToBeGlobalScope,
  expectToBeIdentifier,
  parseAndAnalyze,
} from '../util';

describe('Class fields', () => {
  it('class C { f = g }', () => {
    const { scopeManager } = parseAndAnalyze('class C { f = g }');

    const globalScope = scopeManager.scopes[0];
    expectToBeGlobalScope(globalScope);

    const classScope = globalScope.childScopes[0];
    // should create a class scope
    expectToBeClassScope(classScope);
    // The class scope has no references
    expect(classScope.references).toHaveLength(0);
    // The class scope has only the variable 'C'; it doesn't have the field name 'f'.
    expect(classScope.variables).toHaveLength(1);
    expect(classScope.variables[0].name).toBe('C');

    const classFieldInitializerScope = classScope.childScopes[0];
    // The class scope has a class-field-initializer scope.
    expectToBeClassFieldInitializerScope(classFieldInitializerScope);
    // The class-field-initializer scope's block is the node of the field initializer.
    expectToBeIdentifier(classFieldInitializerScope.block);
    expect(classFieldInitializerScope.block.name).toBe('g');
    // The class-field-initializer scope's variableScope is itself.
    expect(classFieldInitializerScope.variableScope).toBe(
      classFieldInitializerScope,
    );
    // The class-field-initializer scope has only the reference 'g'.
    expect(classFieldInitializerScope.references).toHaveLength(1);
    expect(classFieldInitializerScope.references[0].identifier.name).toBe('g');
    // The class-field-initializer scope has no variables.
    expect(classFieldInitializerScope.variables).toHaveLength(0);
  });

  describe('class C { f }', () => {
    const { scopeManager } = parseAndAnalyze('class C { f }');

    const globalScope = scopeManager.scopes[0];
    expectToBeGlobalScope(globalScope);

    const classScope = globalScope.childScopes[0];
    // should create a class scope
    expectToBeClassScope(classScope);
    // The class scope has no references
    expect(classScope.references).toHaveLength(0);
    // The class scope has no child scopes; fields that don't have initializers don't create any class-field-initializer scopes.
    expect(classScope.childScopes).toHaveLength(0);
    // The class scope has only the variable 'C'; it doesn't have the field name 'f'.
    expect(classScope.variables).toHaveLength(1);
    expect(classScope.variables[0].name).toBe('C');
  });

  describe('class C { [fname] }', () => {
    const { scopeManager } = parseAndAnalyze('class C { [fname] }');

    const globalScope = scopeManager.scopes[0];
    expectToBeGlobalScope(globalScope);

    const classScope = globalScope.childScopes[0];
    // should create a class scope
    expectToBeClassScope(classScope);
    // The class scope has only the reference `fname`.
    expect(classScope.references).toHaveLength(1);
    // The class scope has no child scopes; fields that don't have initializers don't create any class-field-initializer scopes.
    expect(classScope.childScopes).toHaveLength(0);
  });

  describe('class C { [fname] = value }', () => {
    const { scopeManager } = parseAndAnalyze('class C { [fname] = value }');

    const globalScope = scopeManager.scopes[0];
    expectToBeGlobalScope(globalScope);

    const classScope = globalScope.childScopes[0];
    // should create a class scope
    expectToBeClassScope(classScope);
    // The class scope has only the reference `fname`; it doesn't have the reference 'value'.
    expect(classScope.references).toHaveLength(1);
    expect(classScope.references[0].identifier.name).toBe('fname');

    const classFieldInitializerScope = classScope.childScopes[0];
    // The class scope has a class-field-initializer scope.
    expectToBeClassFieldInitializerScope(classFieldInitializerScope);
    // The class-field-initializer scope has the reference 'value'.
    expect(classFieldInitializerScope.references).toHaveLength(1);
    expect(classFieldInitializerScope.references[0].identifier.name).toBe(
      'value',
    );
    // The class-field-initializer scope has no variables.
    expect(classFieldInitializerScope.variables).toHaveLength(0);
  });
});
