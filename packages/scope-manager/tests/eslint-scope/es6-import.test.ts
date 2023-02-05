import {
  expectToBeGlobalScope,
  expectToBeImportBindingDefinition,
  expectToBeModuleScope,
  expectToBeVariableDefinition,
  getRealVariables,
} from '../util';
import { parseAndAnalyze } from '../util/parse';

describe('import declaration', () => {
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-static-and-runtme-semantics-module-records
  it('should import names from source', () => {
    const { scopeManager } = parseAndAnalyze('import v from "mod";', 'module');

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('v');
    expectToBeImportBindingDefinition(variables[0].defs[0]);
    expect(scope.references).toHaveLength(0);
  });

  it('should import namespaces', () => {
    const { scopeManager } = parseAndAnalyze(
      'import * as ns from "mod";',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('ns');
    expectToBeImportBindingDefinition(variables[0].defs[0]);
    expect(scope.references).toHaveLength(0);
  });

  it('should import insided names#1', () => {
    const { scopeManager } = parseAndAnalyze(
      'import {x} from "mod";',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('x');
    expectToBeImportBindingDefinition(variables[0].defs[0]);
    expect(scope.references).toHaveLength(0);
  });

  it('should import insided names#2', () => {
    const { scopeManager } = parseAndAnalyze(
      'import {x as v} from "mod";',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('v');
    expectToBeImportBindingDefinition(variables[0].defs[0]);
    expect(scope.references).toHaveLength(0);
  });

  it('should reference imports', () => {
    const imports = [
      'import v from "mod";',
      'import { v } from "mod";',
      'import * as v from "mod";',
    ];
    for (const code of imports) {
      const { scopeManager } = parseAndAnalyze(
        `
          ${code}
          const x = v;
        `,
        'module',
      );

      expect(scopeManager.scopes).toHaveLength(2);

      let scope = scopeManager.scopes[0];
      let variables = getRealVariables(scope.variables);
      expectToBeGlobalScope(scope);
      expect(variables).toHaveLength(0);
      expect(scope.references).toHaveLength(0);

      scope = scopeManager.scopes[1];
      variables = getRealVariables(scope.variables);
      expectToBeModuleScope(scope);
      expect(scope.isStrict).toBeTruthy();
      expect(variables).toHaveLength(2);
      const importV = variables[0];
      expect(importV.name).toBe('v');
      expectToBeImportBindingDefinition(importV.defs[0]);
      const variableX = variables[1];
      expect(variableX.name).toBe('x');
      expectToBeVariableDefinition(variableX.defs[0]);

      expect(scope.references).toHaveLength(2);
      expect(scope.references[0].resolved).toBe(variableX);
      expect(scope.references[1].resolved).toBe(importV);
    }
  });
});
