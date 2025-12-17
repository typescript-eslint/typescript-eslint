import { analyze } from '../src';
import { parse } from './test-utils';

describe('analyze()', () => {
  it('should throw error when passed a partial AST node', () => {
    const ast = parse(`const hello: string = 'world';`, {
      range: true,
    });
    const partialNode = ast.body[0];

    expect(() => {
      // @ts-expect-error -- to reproduce https://github.com/typescript-eslint/typescript-eslint/issues/11727
      analyze(partialNode);
    }).toThrowError();
  });
});
