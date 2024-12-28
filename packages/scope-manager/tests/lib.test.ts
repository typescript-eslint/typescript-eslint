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

  it('should define an implicit variable if there is a reference', () => {
    const { scopeManager } = parseAndAnalyze('new ArrayBuffer();', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    expect(
      variables.some(
        v => v instanceof ImplicitLibVariable && v.name === 'ArrayBuffer',
      ),
    ).toEqual(true);
  });

  it('should define an implicit variable if there is a collision', () => {
    const { scopeManager } = parseAndAnalyze('var Symbol = {};', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    expect(
      variables.some(
        v => v instanceof ImplicitLibVariable && v.name === 'Symbol',
      ),
    ).toEqual(true);
  });
});
