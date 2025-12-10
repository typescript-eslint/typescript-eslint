import type { AnalyzeOptions } from '../src/analyze';

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
        lib: ['invalid+lib'] as unknown as AnalyzeOptions['lib'],
      });
    }).toThrowError('invalid+lib');
  });
});
