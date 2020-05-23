import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  expectToBeModuleScope,
  parseAndAnalyze,
} from '../util';

describe('impliedStrict option', () => {
  it('ensures all user scopes are strict if ecmaVersion >= 5', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        function foo() {
          function bar() {
            "use strict";
          }
        }
      `,
      {
        ecmaVersion: 5,
        impliedStrict: true,
      },
    );

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];

    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeTruthy();

    scope = scopeManager.scopes[1];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBeTruthy();

    scope = scopeManager.scopes[2];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBeTruthy();
  });

  it('ensures impliedStrict option is only effective when ecmaVersion option >= 5', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        function foo() {}
      `,
      {
        ecmaVersion: 3,
        impliedStrict: true,
      },
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];

    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();

    scope = scopeManager.scopes[1];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBeFalsy();
  });

  it('omits a nodejs global scope when ensuring all user scopes are strict', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        function foo() {}
      `,
      {
        ecmaVersion: 5,
        globalReturn: true,
        impliedStrict: true,
      },
    );

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];

    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();

    scope = scopeManager.scopes[1];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeTruthy();

    scope = scopeManager.scopes[2];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBeTruthy();
  });

  it('omits a module global scope when ensuring all user scopes are strict', () => {
    const { scopeManager } = parseAndAnalyze('function foo() {}', {
      ecmaVersion: 6,
      impliedStrict: true,
      sourceType: 'module',
    });

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];

    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();

    scope = scopeManager.scopes[1];
    expectToBeModuleScope(scope);
    expect(scope.isStrict).toBeTruthy();

    scope = scopeManager.scopes[2];
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBeTruthy();
  });
});
