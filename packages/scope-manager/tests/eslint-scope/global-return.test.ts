import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeGlobalScope,
  expectToBeFunctionScope,
  expectToBeModuleScope,
  expectToBeImportBindingDefinition,
} from '../util';
import { parseAndAnalyze } from '../util/parse';

describe('gloablReturn option', () => {
  it('creates a function scope following the global scope immediately', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        "use strict";
        var hello = 20;
      `,
      { globalReturn: true },
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];

    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(scope.variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeTruthy();
    expect(scope.variables).toHaveLength(2);
    expect(scope.variables[0].name).toBe('arguments');
    expect(scope.variables[1].name).toBe('hello');
  });

  it('creates a function scope following the global scope immediately and creates module scope', () => {
    const { scopeManager } = parseAndAnalyze("import {x as v} from 'mod';", {
      sourceType: 'module',
      globalReturn: true,
    });

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];

    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(scope.variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(scope.variables).toHaveLength(1);
    expect(scope.variables[0].name).toBe('arguments');

    scope = scopeManager.scopes[2];
    expectToBeModuleScope(scope);
    expect(scope.variables).toHaveLength(1);
    expect(scope.variables[0].name).toBe('v');
    expectToBeImportBindingDefinition(scope.variables[0].defs[0]);
    expect(scope.references).toHaveLength(0);
  });
});
