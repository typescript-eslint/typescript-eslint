import { analyze } from '../src';
import { parse } from './test-utils';

describe('analyze()', () => {
  it('should throw error when passed a partial AST node (exact bug reproduction from issue)', () => {
    const ast = parse(`const hello: string = 'world';`);
    const partialNode = ast.body[0];

    expect(() => {
      // @ts-expect-error -- to reproduce https://github.com/typescript-eslint/typescript-eslint/issues/11727
      analyze(partialNode);
    }).toThrow();
  });
});
