import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { ImplicitLibVariable, ScopeType } from '../src';
import { parseAndAnalyze } from './test-utils';

describe('implicit lib definitions', () => {
  it('should define no implicit variables if provided an empty array', () => {
    const { scopeManager } = parseAndAnalyze('', {
      lib: [],
    });

    const variables = scopeManager.variables;
    expect(variables).toHaveLength(1);
  });

  it('should define an implicit variable if there is a value reference', () => {
    const { scopeManager } = parseAndAnalyze('new ArrayBuffer();', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    const arrayBufferVariables = variables.filter(
      v => v.name === 'ArrayBuffer',
    );
    expect(arrayBufferVariables).toHaveLength(1);
    expect(arrayBufferVariables[0]).toBeInstanceOf(ImplicitLibVariable);
  });

  it('should define an implicit variable if there is a type reference', () => {
    const { scopeManager } = parseAndAnalyze('type T = ArrayBuffer;', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    const arrayBufferVariables = variables.filter(
      v => v.name === 'ArrayBuffer',
    );
    expect(arrayBufferVariables).toHaveLength(1);
    expect(arrayBufferVariables[0]).toBeInstanceOf(ImplicitLibVariable);
  });

  it('should define an implicit variable if there is a nested value reference', () => {
    const { scopeManager } = parseAndAnalyze(
      'var f = () => new ArrayBuffer();',
      {
        lib: ['es2015'],
      },
    );

    const variables = scopeManager.variables;
    const arrayBufferVariables = variables.filter(
      v => v.name === 'ArrayBuffer',
    );
    expect(arrayBufferVariables).toHaveLength(1);
    expect(arrayBufferVariables[0]).toBeInstanceOf(ImplicitLibVariable);
    const reference = scopeManager.scopes
      .flatMap(scope => scope.references)
      .find(reference => reference.identifier.name === 'ArrayBuffer');
    expect(reference?.resolved).toBe(arrayBufferVariables[0]);
  });

  it('should define an implicit variable if there is a nested type reference', () => {
    const { scopeManager } = parseAndAnalyze(
      'var f = <T extends ArrayBuffer>(): T => undefined as T;',
      {
        lib: ['es2015'],
      },
    );

    const variables = scopeManager.variables;
    const arrayBufferVariables = variables.filter(
      v => v.name === 'ArrayBuffer',
    );
    expect(arrayBufferVariables).toHaveLength(1);
    expect(arrayBufferVariables[0]).toBeInstanceOf(ImplicitLibVariable);
    const reference = scopeManager.scopes
      .flatMap(scope => scope.references)
      .find(reference => reference.identifier.name === 'ArrayBuffer');
    expect(reference?.resolved).toBe(arrayBufferVariables[0]);
  });

  it('should define an implicit variable if there is a value collision', () => {
    const { ast, scopeManager } = parseAndAnalyze('var Symbol = 1;', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    const symbolVariables = variables.filter(v => v.name === 'Symbol');
    expect(symbolVariables).toHaveLength(1);
    expect(symbolVariables[0]).toBeInstanceOf(ImplicitLibVariable);
    expect(symbolVariables[0].defs).toHaveLength(1);
    expect(symbolVariables[0].identifiers).toHaveLength(1);

    const definition = symbolVariables[0].defs[0];
    expect(scopeManager.getDeclaredVariables(definition.node)).toContain(
      symbolVariables[0],
    );
    expect(scopeManager.getDeclaredVariables(definition.parent!)).toContain(
      symbolVariables[0],
    );
    expect(scopeManager.getDeclaredVariables(ast.body[0])).toContain(
      symbolVariables[0],
    );
  });

  it('should define an implicit variable if there is a type collision', () => {
    const { scopeManager } = parseAndAnalyze('type Symbol = 1;', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    const symbolVariables = variables.filter(v => v.name === 'Symbol');
    expect(symbolVariables).toHaveLength(1);
    expect(symbolVariables[0]).toBeInstanceOf(ImplicitLibVariable);
  });

  it.each(['function Map() {}', 'class Map {}'])(
    'should update declared variables for a %s collision',
    code => {
      const { ast, scopeManager } = parseAndAnalyze(code, {
        lib: ['es2015'],
      });

      const mapVariable = scopeManager.globalScope!.set.get('Map');
      expect(mapVariable).toBeInstanceOf(ImplicitLibVariable);
      expect(mapVariable?.defs).toHaveLength(1);
      expect(scopeManager.getDeclaredVariables(ast.body[0])).toContain(
        mapVariable,
      );
    },
  );

  it('should preserve declared variables for multiple declarations', () => {
    const { ast, scopeManager } = parseAndAnalyze('var Map = 1, other = 2;', {
      lib: ['es2015'],
    });

    const mapVariable = scopeManager.globalScope!.set.get('Map');
    const otherVariable = scopeManager.globalScope!.set.get('other');
    const declaration = ast.body[0];
    if (declaration.type !== AST_NODE_TYPES.VariableDeclaration) {
      throw new Error('Expected a variable declaration');
    }

    expect(mapVariable).toBeInstanceOf(ImplicitLibVariable);
    expect(otherVariable).not.toBeInstanceOf(ImplicitLibVariable);
    expect(scopeManager.getDeclaredVariables(declaration)).toEqual(
      expect.arrayContaining([mapVariable, otherVariable]),
    );
    expect(
      scopeManager.getDeclaredVariables(declaration.declarations[0]),
    ).toEqual([mapVariable]);
  });

  it('should resolve references after upgrading a global collision', () => {
    const { scopeManager } = parseAndAnalyze('var Map = 1; Map;', {
      lib: ['es2015'],
    });

    const mapVariable = scopeManager.globalScope!.set.get('Map');
    const mapReferences = scopeManager.globalScope!.references.filter(
      reference => reference.identifier.name === 'Map',
    );

    expect(mapVariable).toBeInstanceOf(ImplicitLibVariable);
    expect(mapReferences.length).toBeGreaterThan(0);
    expect(
      mapReferences.every(reference => reference.resolved === mapVariable),
    ).toBe(true);
  });

  it('should preserve multiple declarations when upgrading a global collision', () => {
    const { scopeManager } = parseAndAnalyze('var Map = 1; var Map = 2; Map;', {
      lib: ['es2015'],
    });

    const mapVariable = scopeManager.globalScope!.set.get('Map');
    expect(mapVariable).toBeInstanceOf(ImplicitLibVariable);
    expect(mapVariable?.defs).toHaveLength(2);
    expect(mapVariable?.identifiers).toHaveLength(2);
    expect(
      mapVariable?.references.every(
        reference => reference.resolved === mapVariable,
      ),
    ).toBe(true);
  });

  it('should define an implicit variable if there is a nested value collision', () => {
    const { scopeManager } = parseAndAnalyze('var f = (Symbol) => Symbol;', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    const symbolVariables = variables.filter(v => v.name === 'Symbol');
    expect(symbolVariables).toHaveLength(2);
    expect(symbolVariables.some(v => v instanceof ImplicitLibVariable)).toBe(
      true,
    );
    expect(symbolVariables.some(v => !(v instanceof ImplicitLibVariable))).toBe(
      true,
    );
  });

  it('should define an implicit variable if there is a nested type collision', () => {
    const { scopeManager } = parseAndAnalyze('var f = (a: Symbol) => a;', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    const symbolVariables = variables.filter(v => v.name === 'Symbol');
    expect(symbolVariables).toHaveLength(1);
    expect(symbolVariables[0]).toBeInstanceOf(ImplicitLibVariable);
  });

  it('should not resolve a value reference to a type-only lib variable', () => {
    const { scopeManager } = parseAndAnalyze('PropertyKey;', {
      lib: ['es5'],
    });

    const propertyKey = scopeManager.globalScope!.set.get('PropertyKey');
    expect(propertyKey).toBeInstanceOf(ImplicitLibVariable);
    expect(propertyKey?.isTypeVariable).toBe(true);
    expect(propertyKey?.isValueVariable).toBe(false);

    const reference = scopeManager.globalScope!.references.find(
      reference => reference.identifier.name === 'PropertyKey',
    );
    expect(reference?.resolved).toBeNull();
    expect(scopeManager.globalScope!.through).toContain(reference);
  });

  it('should resolve a type reference to a type-only lib variable', () => {
    const { scopeManager } = parseAndAnalyze('type Key = PropertyKey;', {
      lib: ['es5'],
    });

    const propertyKey = scopeManager.globalScope!.set.get('PropertyKey');
    const reference = scopeManager.globalScope!.references.find(
      reference => reference.identifier.name === 'PropertyKey',
    );

    expect(propertyKey?.isTypeVariable).toBe(true);
    expect(propertyKey?.isValueVariable).toBe(false);
    expect(reference?.resolved).toBe(propertyKey);
  });

  it('should keep module declarations separate from global lib variables', () => {
    const { scopeManager } = parseAndAnalyze('export const Map = 1;', {
      lib: ['es2015'],
      sourceType: 'module',
    });

    const globalMap = scopeManager.globalScope!.set.get('Map');
    const moduleScope = scopeManager.scopes.find(
      scope => scope.type === ScopeType.module,
    );
    const moduleMap = moduleScope?.set.get('Map');

    expect(globalMap).toBeInstanceOf(ImplicitLibVariable);
    expect(moduleMap).toBeDefined();
    expect(moduleMap).not.toBe(globalMap);
  });

  it('should throw if passed an unrecognized lib name', () => {
    expect(() => {
      parseAndAnalyze('var f = (a: Symbol) => a;', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lib: ['invalid+lib' as any],
      });
    }).toThrow('invalid+lib');
  });
});
