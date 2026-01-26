/* eslint-disable @typescript-eslint/dot-notation -- ['implicit'] is private */

import { ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('ScopeManager#addGlobals', () => {
  it('adds variables to the global scope and resolves references from the global scope', () => {
    const { scopeManager } = parseAndAnalyze(`
            foo = bar + bar;
        `);

    expect(scopeManager.scopes).toHaveLength(1);

    const globalScope = scopeManager.scopes[0];
    assert.isScopeOfType(globalScope, ScopeType.global);

    const variables = getRealVariables(globalScope.variables);
    const typeVariableAmount = globalScope.variables.length - variables.length;
    expect(variables).toHaveLength(0);
    expect(globalScope.set.size).toBe(typeVariableAmount);
    expect(globalScope.references).toHaveLength(3);
    expect(globalScope.references[0].identifier.name).toBe('foo');
    expect(globalScope.references[0].from).toStrictEqual(globalScope);
    expect(globalScope.references[0].resolved).toBeNull();
    expect(globalScope.references[1].identifier.name).toBe('bar');
    expect(globalScope.references[1].from).toStrictEqual(globalScope);
    expect(globalScope.references[1].resolved).toBeNull();
    expect(globalScope.references[2].identifier.name).toBe('bar');
    expect(globalScope.references[2].from).toStrictEqual(globalScope);
    expect(globalScope.references[2].resolved).toBeNull();
    expect(globalScope.references[1]).not.toStrictEqual(
      globalScope.references[2],
    );
    expect(globalScope.through).toHaveLength(3);
    expect(globalScope.through[0]).toStrictEqual(globalScope.references[0]);
    expect(globalScope.through[1]).toStrictEqual(globalScope.references[1]);
    expect(globalScope.through[2]).toStrictEqual(globalScope.references[2]);
    expect(globalScope['implicit'].variables).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].name).toBe('foo');
    expect(globalScope['implicit'].variables[0].references).toHaveLength(0);
    expect(globalScope['implicit'].variables[0].defs).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].identifiers).toHaveLength(1);
    expect(globalScope['implicit'].set.size).toBe(1);
    expect(globalScope['implicit'].set.get('foo')).toStrictEqual(
      globalScope['implicit'].variables[0],
    );
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(3);
    expect(globalScope['implicit'].leftToBeResolved[0]).toStrictEqual(
      globalScope.references[0],
    );
    expect(globalScope['implicit'].leftToBeResolved[1]).toStrictEqual(
      globalScope.references[1],
    );
    expect(globalScope['implicit'].leftToBeResolved[2]).toStrictEqual(
      globalScope.references[2],
    );

    scopeManager.addGlobals(['foo', 'bar']);

    const withAddedVariables = getRealVariables(scopeManager.variables);
    expect(withAddedVariables).toHaveLength(2);
    expect(withAddedVariables[0].name).toBe('foo');
    expect(withAddedVariables[0].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[0].defs).toHaveLength(0);
    expect(withAddedVariables[0].identifiers).toHaveLength(0);
    expect(withAddedVariables[1].name).toBe('bar');
    expect(withAddedVariables[1].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[1].defs).toHaveLength(0);
    expect(withAddedVariables[1].identifiers).toHaveLength(0);
    expect(globalScope.set.size).toBe(typeVariableAmount + 2);
    expect(globalScope.set.get('foo')).toStrictEqual(withAddedVariables[0]);
    expect(globalScope.set.get('bar')).toStrictEqual(withAddedVariables[1]);
    expect(globalScope.references).toHaveLength(3);
    expect(globalScope.references[0].identifier.name).toBe('foo');
    expect(globalScope.references[0].from).toStrictEqual(globalScope);
    expect(globalScope.references[0].resolved).toStrictEqual(
      withAddedVariables[0],
    );
    expect(withAddedVariables[0].references).toHaveLength(1);
    expect(withAddedVariables[0].references[0]).toStrictEqual(
      globalScope.references[0],
    );
    expect(globalScope.references[1].identifier.name).toBe('bar');
    expect(globalScope.references[1].from).toStrictEqual(globalScope);
    expect(globalScope.references[1].resolved).toStrictEqual(
      withAddedVariables[1],
    );
    expect(globalScope.references[2].identifier.name).toBe('bar');
    expect(globalScope.references[2].from).toStrictEqual(globalScope);
    expect(globalScope.references[2].resolved).toStrictEqual(
      withAddedVariables[1],
    );
    expect(withAddedVariables[1].references).toHaveLength(2);
    expect(withAddedVariables[1].references[0]).toStrictEqual(
      globalScope.references[1],
    );
    expect(withAddedVariables[1].references[1]).toStrictEqual(
      globalScope.references[2],
    );
    expect(globalScope.through).toHaveLength(0);
    expect(globalScope['implicit'].variables).toHaveLength(0);
    expect(globalScope['implicit'].set.size).toBe(0);
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(0);
  });

  it('adds variables to the global scope and resolves references from inner scopes', () => {
    const { scopeManager } = parseAndAnalyze(`
            () => foo = bar + bar;
        `);

    expect(scopeManager.scopes).toHaveLength(2);

    const globalScope = scopeManager.scopes[0];
    assert.isScopeOfType(globalScope, ScopeType.global);

    expect(globalScope.type).toBe('global');

    const functionScope = scopeManager.scopes[1];

    expect(functionScope.type).toBe('function');

    expect(functionScope.variables).toHaveLength(0);
    expect(functionScope.set.size).toBe(0);
    expect(functionScope.references).toHaveLength(3);
    expect(functionScope.references[0].identifier.name).toBe('foo');
    expect(functionScope.references[0].from).toStrictEqual(functionScope);
    expect(functionScope.references[0].resolved).toBeNull();
    expect(functionScope.references[1].identifier.name).toBe('bar');
    expect(functionScope.references[1].from).toStrictEqual(functionScope);
    expect(functionScope.references[1].resolved).toBeNull();
    expect(functionScope.references[2].identifier.name).toBe('bar');
    expect(functionScope.references[2].from).toStrictEqual(functionScope);
    expect(functionScope.references[2].resolved).toBeNull();
    expect(functionScope.references[1]).not.toStrictEqual(
      functionScope.references[2],
    );
    expect(functionScope.through).toHaveLength(3);
    expect(functionScope.through[0]).toStrictEqual(functionScope.references[0]);
    expect(functionScope.through[1]).toStrictEqual(functionScope.references[1]);
    expect(functionScope.through[2]).toStrictEqual(functionScope.references[2]);

    const variables = getRealVariables(globalScope.variables);
    const typeVariableAmount = globalScope.variables.length - variables.length;
    expect(variables).toHaveLength(0);
    expect(globalScope.set.size).toBe(typeVariableAmount);
    expect(globalScope.references).toHaveLength(0);
    expect(globalScope.through).toHaveLength(3);
    expect(globalScope.through[0]).toStrictEqual(functionScope.references[0]);
    expect(globalScope.through[1]).toStrictEqual(functionScope.references[1]);
    expect(globalScope.through[2]).toStrictEqual(functionScope.references[2]);
    expect(globalScope['implicit'].variables).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].name).toBe('foo');
    expect(globalScope['implicit'].variables[0].references).toHaveLength(0);
    expect(globalScope['implicit'].variables[0].defs).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].identifiers).toHaveLength(1);
    expect(globalScope['implicit'].set.size).toBe(1);
    expect(globalScope['implicit'].set.get('foo')).toStrictEqual(
      globalScope['implicit'].variables[0],
    );
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(3);
    expect(globalScope['implicit'].leftToBeResolved[0]).toStrictEqual(
      functionScope.references[0],
    );
    expect(globalScope['implicit'].leftToBeResolved[1]).toStrictEqual(
      functionScope.references[1],
    );
    expect(globalScope['implicit'].leftToBeResolved[2]).toStrictEqual(
      functionScope.references[2],
    );

    scopeManager.addGlobals(['foo', 'bar']);

    const withAddedVariables = getRealVariables(globalScope.variables);
    expect(withAddedVariables).toHaveLength(2);
    expect(withAddedVariables[0].name).toBe('foo');
    expect(withAddedVariables[0].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[0].defs).toHaveLength(0);
    expect(withAddedVariables[0].identifiers).toHaveLength(0);
    expect(withAddedVariables[1].name).toBe('bar');
    expect(withAddedVariables[1].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[1].defs).toHaveLength(0);
    expect(withAddedVariables[1].identifiers).toHaveLength(0);
    expect(globalScope.set.size).toBe(typeVariableAmount + 2);
    expect(globalScope.set.get('foo')).toStrictEqual(withAddedVariables[0]);
    expect(globalScope.set.get('bar')).toStrictEqual(withAddedVariables[1]);
    expect(functionScope.variables).toHaveLength(0);
    expect(functionScope.set.size).toBe(0);
    expect(functionScope.references).toHaveLength(3);
    expect(functionScope.references[0].identifier.name).toBe('foo');
    expect(functionScope.references[0].from).toStrictEqual(functionScope);
    expect(functionScope.references[0].resolved).toStrictEqual(
      withAddedVariables[0],
    );
    expect(withAddedVariables[0].references).toHaveLength(1);
    expect(withAddedVariables[0].references[0]).toStrictEqual(
      functionScope.references[0],
    );
    expect(functionScope.references[1].identifier.name).toBe('bar');
    expect(functionScope.references[1].from).toStrictEqual(functionScope);
    expect(functionScope.references[1].resolved).toStrictEqual(
      withAddedVariables[1],
    );
    expect(functionScope.references[2].identifier.name).toBe('bar');
    expect(functionScope.references[2].from).toStrictEqual(functionScope);
    expect(functionScope.references[2].resolved).toStrictEqual(
      withAddedVariables[1],
    );
    expect(functionScope.references[1]).not.toStrictEqual(
      functionScope.references[2],
    );
    expect(withAddedVariables[1].references).toHaveLength(2);
    expect(withAddedVariables[1].references[0]).toStrictEqual(
      functionScope.references[1],
    );
    expect(withAddedVariables[1].references[1]).toStrictEqual(
      functionScope.references[2],
    );
    expect(functionScope.through).toHaveLength(3);
    expect(functionScope.through[0]).toStrictEqual(functionScope.references[0]);
    expect(functionScope.through[1]).toStrictEqual(functionScope.references[1]);
    expect(functionScope.through[2]).toStrictEqual(functionScope.references[2]);
    expect(globalScope.references).toHaveLength(0);
    expect(globalScope.through).toHaveLength(0);
    expect(globalScope['implicit'].variables).toHaveLength(0);
    expect(globalScope['implicit'].set.size).toBe(0);
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(0);
  });

  it("adds variables to the global scope and doesn't affect unrelated references", () => {
    const { scopeManager } = parseAndAnalyze(`
            foo = bar + bar;
        `);

    expect(scopeManager.scopes).toHaveLength(1);

    const globalScope = scopeManager.scopes[0];
    assert.isScopeOfType(globalScope, ScopeType.global);

    expect(globalScope.type).toBe('global');

    const variables = getRealVariables(globalScope.variables);
    const typeVariableAmount = globalScope.variables.length - variables.length;
    expect(variables).toHaveLength(0);
    expect(globalScope.set.size).toBe(typeVariableAmount);
    expect(globalScope.references).toHaveLength(3);
    expect(globalScope.references[0].identifier.name).toBe('foo');
    expect(globalScope.references[0].from).toStrictEqual(globalScope);
    expect(globalScope.references[0].resolved).toBeNull();
    expect(globalScope.references[1].identifier.name).toBe('bar');
    expect(globalScope.references[1].from).toStrictEqual(globalScope);
    expect(globalScope.references[1].resolved).toBeNull();
    expect(globalScope.references[2].identifier.name).toBe('bar');
    expect(globalScope.references[2].from).toStrictEqual(globalScope);
    expect(globalScope.references[2].resolved).toBeNull();
    expect(globalScope.references[1]).not.toStrictEqual(
      globalScope.references[2],
    );
    expect(globalScope.through).toHaveLength(3);
    expect(globalScope.through[0]).toStrictEqual(globalScope.references[0]);
    expect(globalScope.through[1]).toStrictEqual(globalScope.references[1]);
    expect(globalScope.through[2]).toStrictEqual(globalScope.references[2]);
    expect(globalScope['implicit'].variables).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].name).toBe('foo');
    expect(globalScope['implicit'].variables[0].references).toHaveLength(0);
    expect(globalScope['implicit'].variables[0].defs).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].identifiers).toHaveLength(1);
    expect(globalScope['implicit'].set.size).toBe(1);
    expect(globalScope['implicit'].set.get('foo')).toStrictEqual(
      globalScope['implicit'].variables[0],
    );
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(3);
    expect(globalScope['implicit'].leftToBeResolved[0]).toStrictEqual(
      globalScope.references[0],
    );
    expect(globalScope['implicit'].leftToBeResolved[1]).toStrictEqual(
      globalScope.references[1],
    );
    expect(globalScope['implicit'].leftToBeResolved[2]).toStrictEqual(
      globalScope.references[2],
    );

    scopeManager.addGlobals(['baz', 'qux']);

    const withAddedVariables = getRealVariables(scopeManager.variables);
    expect(withAddedVariables).toHaveLength(2);
    expect(withAddedVariables[0].name).toBe('baz');
    expect(withAddedVariables[0].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[0].defs).toHaveLength(0);
    expect(withAddedVariables[0].identifiers).toHaveLength(0);
    expect(withAddedVariables[0].references).toHaveLength(0);
    expect(withAddedVariables[1].name).toBe('qux');
    expect(withAddedVariables[1].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[1].defs).toHaveLength(0);
    expect(withAddedVariables[1].identifiers).toHaveLength(0);
    expect(withAddedVariables[1].references).toHaveLength(0);
    expect(globalScope.set.size).toBe(typeVariableAmount + 2);
    expect(globalScope.set.get('baz')).toStrictEqual(withAddedVariables[0]);
    expect(globalScope.set.get('qux')).toStrictEqual(withAddedVariables[1]);
    expect(globalScope.references).toHaveLength(3);
    expect(globalScope.references[0].identifier.name).toBe('foo');
    expect(globalScope.references[0].from).toStrictEqual(globalScope);
    expect(globalScope.references[0].resolved).toBeNull();
    expect(globalScope.references[1].identifier.name).toBe('bar');
    expect(globalScope.references[1].from).toStrictEqual(globalScope);
    expect(globalScope.references[1].resolved).toBeNull();
    expect(globalScope.references[2].identifier.name).toBe('bar');
    expect(globalScope.references[2].from).toStrictEqual(globalScope);
    expect(globalScope.references[2].resolved).toBeNull();
    expect(globalScope.references[1]).not.toStrictEqual(
      globalScope.references[2],
    );
    expect(globalScope.through).toHaveLength(3);
    expect(globalScope.through[0]).toStrictEqual(globalScope.references[0]);
    expect(globalScope.through[1]).toStrictEqual(globalScope.references[1]);
    expect(globalScope.through[2]).toStrictEqual(globalScope.references[2]);
    expect(globalScope['implicit'].variables).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].name).toBe('foo');
    expect(globalScope['implicit'].variables[0].references).toHaveLength(0);
    expect(globalScope['implicit'].variables[0].defs).toHaveLength(1);
    expect(globalScope['implicit'].variables[0].identifiers).toHaveLength(1);
    expect(globalScope['implicit'].set.size).toBe(1);
    expect(globalScope['implicit'].set.get('foo')).toStrictEqual(
      globalScope['implicit'].variables[0],
    );
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(3);
    expect(globalScope['implicit'].leftToBeResolved[0]).toStrictEqual(
      globalScope.references[0],
    );
    expect(globalScope['implicit'].leftToBeResolved[1]).toStrictEqual(
      globalScope.references[1],
    );
    expect(globalScope['implicit'].leftToBeResolved[2]).toStrictEqual(
      globalScope.references[2],
    );
  });

  it("doesn't affect already declared global variables", () => {
    const { scopeManager } = parseAndAnalyze(
      `
            let foo = bar + bar;
            var bar;
        `,
      'script',
    );

    expect(scopeManager.scopes).toHaveLength(1);

    const globalScope = scopeManager.scopes[0];
    assert.isScopeOfType(globalScope, ScopeType.global);

    expect(globalScope.type).toBe('global');

    const variables = getRealVariables(globalScope.variables);
    const typeVariableAmount = globalScope.variables.length - variables.length;
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('foo');
    expect(variables[0].scope).toStrictEqual(globalScope);
    expect(variables[0].defs).toHaveLength(1);
    expect(variables[0].identifiers).toHaveLength(1);
    expect(variables[1].name).toBe('bar');
    expect(variables[1].scope).toStrictEqual(globalScope);
    expect(variables[1].defs).toHaveLength(1);
    expect(variables[1].identifiers).toHaveLength(1);
    expect(globalScope.set.size).toBe(typeVariableAmount + 2);
    expect(globalScope.set.get('foo')).toStrictEqual(variables[0]);
    expect(globalScope.set.get('bar')).toStrictEqual(variables[1]);
    expect(globalScope.references).toHaveLength(3);
    expect(globalScope.references[0].identifier.name).toBe('foo');
    expect(globalScope.references[0].from).toStrictEqual(globalScope);
    expect(globalScope.references[0].resolved).toStrictEqual(variables[0]);
    expect(variables[0].references).toHaveLength(1);
    expect(variables[0].references[0]).toStrictEqual(globalScope.references[0]);
    expect(globalScope.references[1].identifier.name).toBe('bar');
    expect(globalScope.references[1].from).toStrictEqual(globalScope);
    expect(globalScope.references[1].resolved).toStrictEqual(variables[1]);
    expect(globalScope.references[2].identifier.name).toBe('bar');
    expect(globalScope.references[2].from).toStrictEqual(globalScope);
    expect(globalScope.references[2].resolved).toStrictEqual(variables[1]);
    expect(variables[1].references).toHaveLength(2);
    expect(variables[1].references[0]).toStrictEqual(globalScope.references[1]);
    expect(variables[1].references[1]).toStrictEqual(globalScope.references[2]);
    expect(globalScope.through).toHaveLength(0);
    expect(globalScope['implicit'].variables).toHaveLength(0);
    expect(globalScope['implicit'].set.size).toBe(0);
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(0);

    scopeManager.addGlobals(['foo', 'bar']);
    const withAddedVariables = getRealVariables(scopeManager.variables);
    expect(withAddedVariables).toHaveLength(2);
    expect(withAddedVariables[0].name).toBe('foo');
    expect(withAddedVariables[0].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[0].defs).toHaveLength(1);
    expect(withAddedVariables[0].identifiers).toHaveLength(1);
    expect(withAddedVariables[1].name).toBe('bar');
    expect(withAddedVariables[1].scope).toStrictEqual(globalScope);
    expect(withAddedVariables[1].defs).toHaveLength(1);
    expect(withAddedVariables[1].identifiers).toHaveLength(1);
    expect(globalScope.set.size).toBe(typeVariableAmount + 2);
    expect(globalScope.set.get('foo')).toStrictEqual(withAddedVariables[0]);
    expect(globalScope.set.get('bar')).toStrictEqual(withAddedVariables[1]);
    expect(globalScope.references).toHaveLength(3);
    expect(globalScope.references[0].identifier.name).toBe('foo');
    expect(globalScope.references[0].from).toStrictEqual(globalScope);
    expect(globalScope.references[0].resolved).toStrictEqual(
      withAddedVariables[0],
    );
    expect(withAddedVariables[0].references).toHaveLength(1);
    expect(withAddedVariables[0].references[0]).toStrictEqual(
      globalScope.references[0],
    );
    expect(globalScope.references[1].identifier.name).toBe('bar');
    expect(globalScope.references[1].from).toStrictEqual(globalScope);
    expect(globalScope.references[1].resolved).toStrictEqual(
      withAddedVariables[1],
    );
    expect(globalScope.references[2].identifier.name).toBe('bar');
    expect(globalScope.references[2].from).toStrictEqual(globalScope);
    expect(globalScope.references[2].resolved).toStrictEqual(
      withAddedVariables[1],
    );
    expect(withAddedVariables[1].references).toHaveLength(2);
    expect(withAddedVariables[1].references[0]).toStrictEqual(
      globalScope.references[1],
    );
    expect(withAddedVariables[1].references[1]).toStrictEqual(
      globalScope.references[2],
    );
    expect(globalScope.through).toHaveLength(0);
    expect(globalScope['implicit'].variables).toHaveLength(0);
    expect(globalScope['implicit'].set.size).toBe(0);
    expect(globalScope['implicit'].leftToBeResolved).toHaveLength(0);
  });
});
