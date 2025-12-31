/* eslint-disable @typescript-eslint/dot-notation -- ['implicit'] is private */
import type { Variable, Reference } from '../../src/index.js';

import { DefinitionType, ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('implicit global reference', () => {
  it('assignments global scope', () => {
    const { scopeManager } = parseAndAnalyze(`
      var x = 20;
      x = 300;
    `);

    const { scopes } = scopeManager;

    expect(
      scopes.map(scope =>
        getRealVariables(scope.variables).map(variable =>
          variable.defs.map(def => def.type),
        ),
      ),
    ).toStrictEqual([[[DefinitionType.Variable]]]);

    assert.isScopeOfType(scopes[0], ScopeType.global);
    expect(
      scopes[0]['implicit'].variables.map(
        (variable: Variable) => variable.name,
      ),
    ).toStrictEqual([]);
    expect(
      scopes[0]['implicit'].leftToBeResolved.map(
        reference => reference.identifier.name,
      ),
    ).toStrictEqual([]);
    expect(scopes[0].through).toStrictEqual([]);
  });

  it('assignments global scope without definition', () => {
    const { scopeManager } = parseAndAnalyze(`
      x = 300;
      x = 300;
    `);

    const { scopes } = scopeManager;

    expect(
      scopes.map(scope =>
        getRealVariables(scope.variables).map(variable =>
          variable.defs.map(def => def.type),
        ),
      ),
    ).toStrictEqual([[]]);

    assert.isScopeOfType(scopes[0], ScopeType.global);
    expect(
      scopes[0]['implicit'].variables.map(
        (variable: Variable) => variable.name,
      ),
    ).toStrictEqual(['x']);
    expect(
      scopes[0]['implicit'].leftToBeResolved.map(
        reference => reference.identifier.name,
      ),
    ).toStrictEqual(['x', 'x']);
    expect(
      scopes[0].through.map(reference => reference.identifier.name),
    ).toStrictEqual(['x', 'x']);
  });

  it('assignments global scope without definition eval', () => {
    const { scopeManager } = parseAndAnalyze(`
      function inner() {
        eval(str);
        x = 300;
      }
    `);

    const { scopes } = scopeManager;

    expect(
      scopes.map(scope =>
        getRealVariables(scope.variables).map(variable =>
          variable.defs.map(def => def.type),
        ),
      ),
    ).toStrictEqual([[[DefinitionType.FunctionName]], [[]]]);

    assert.isScopeOfType(scopes[0], ScopeType.global);
    expect(
      scopes[0]['implicit'].variables.map(
        (variable: Variable) => variable.name,
      ),
    ).toStrictEqual(['x']);
  });

  it('assignment leaks', () => {
    const { scopeManager } = parseAndAnalyze(`
      function outer() {
        x = 20;
      }
    `);

    const { scopes } = scopeManager;

    expect(
      scopes.map(scope =>
        getRealVariables(scope.variables).map(variable => variable.name),
      ),
    ).toStrictEqual([['outer'], ['arguments']]);

    assert.isScopeOfType(scopes[0], ScopeType.global);
    expect(
      scopes[0]['implicit'].variables.map(
        (variable: Variable) => variable.name,
      ),
    ).toStrictEqual(['x']);
    expect(
      scopes[0]['implicit'].leftToBeResolved.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual(['x']);
    expect(
      scopes[0].through.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual(['x']);
  });

  it("assignment doesn't leak", () => {
    const { scopeManager } = parseAndAnalyze(`
      function outer() {
        function inner() {
          x = 20;
        }
        var x;
      }
    `);

    const { scopes } = scopeManager;

    expect(
      scopes.map(scope =>
        getRealVariables(scope.variables).map(variable => variable.name),
      ),
    ).toStrictEqual([['outer'], ['arguments', 'inner', 'x'], ['arguments']]);

    assert.isScopeOfType(scopes[0], ScopeType.global);
    expect(
      scopes[0]['implicit'].variables.map(
        (variable: Variable) => variable.name,
      ),
    ).toStrictEqual([]);
    expect(
      scopes[0]['implicit'].leftToBeResolved.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual([]);
    expect(
      scopes[0].through.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual([]);
  });

  it('for-in-statement leaks', () => {
    const { scopeManager } = parseAndAnalyze(`
      function outer() {
        for (x in y) { }
      }
    `);

    const { scopes } = scopeManager;

    expect(
      scopes.map(scope =>
        getRealVariables(scope.variables).map(variable => variable.name),
      ),
    ).toStrictEqual([['outer'], ['arguments'], []]);

    assert.isScopeOfType(scopes[0], ScopeType.global);
    expect(
      scopes[0]['implicit'].variables.map(
        (variable: Variable) => variable.name,
      ),
    ).toStrictEqual(['x']);
    expect(
      scopes[0]['implicit'].leftToBeResolved.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual(['x', 'y']);
    expect(
      scopes[0].through.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual(['x', 'y']);
  });

  it("for-in-statement doesn't leaks", () => {
    const { scopeManager } = parseAndAnalyze(`
      function outer() {
        function inner() {
          for (x in y) { }
        }
        var x;
      }
    `);

    const { scopes } = scopeManager;

    expect(
      scopes.map(scope =>
        getRealVariables(scope.variables).map(variable => variable.name),
      ),
    ).toStrictEqual([
      ['outer'],
      ['arguments', 'inner', 'x'],
      ['arguments'],
      [],
    ]);

    assert.isScopeOfType(scopes[0], ScopeType.global);
    expect(
      scopes[0]['implicit'].variables.map(
        (variable: Variable) => variable.name,
      ),
    ).toStrictEqual([]);
    expect(
      scopes[0]['implicit'].leftToBeResolved.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual(['y']);
    expect(
      scopes[0].through.map(
        (reference: Reference) => reference.identifier.name,
      ),
    ).toStrictEqual(['y']);
  });
});
