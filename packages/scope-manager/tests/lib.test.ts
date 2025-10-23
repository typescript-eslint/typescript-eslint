import { ImplicitLibVariable } from '../src';
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
  });

  it('should define an implicit variable if there is a value collision', () => {
    const { scopeManager } = parseAndAnalyze('var Symbol = 1;', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    const symbolVariables = variables.filter(v => v.name === 'Symbol');
    expect(symbolVariables).toHaveLength(1);
    expect(symbolVariables[0]).toBeInstanceOf(ImplicitLibVariable);
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

  it('should throw if passed an unrecognized lib name', () => {
    expect(() => {
      parseAndAnalyze('var f = (a: Symbol) => a;', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lib: ['invalid+lib' as any],
      });
    }).toThrow('invalid+lib');
  });

  it('should merge duplicate variable definitions with different properties', () => {
    // taken from https://github.com/eslint/eslint/pull/19695/files#diff-a82bd73f60a34f613614f30df6bbb802c8d9294735b8f9ffe8e7a8ce5d51629aR3841
    const { scopeManager } = parseAndAnalyze(
      'Object; Boolean; String; Math; Date; Array; Map; Set;',
      {
        lib: ['es2015'],
      },
    );

    const variables = scopeManager.variables;
    const globalVariables = variables.filter(
      v =>
        v.name === 'Object' ||
        v.name === 'Boolean' ||
        v.name === 'String' ||
        v.name === 'Math' ||
        v.name === 'Date' ||
        v.name === 'Array' ||
        v.name === 'Map' ||
        v.name === 'Set',
    );
    expect(globalVariables).toHaveLength(8);

    for (const globalVariable of globalVariables) {
      expect(globalVariable.references).toHaveLength(1);
    }
  });
});
