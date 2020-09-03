import { analyze } from '../../src/analyze';
import { Referencer } from '../../src/referencer';
import { TSESTree, EcmaVersion, Lib } from '@typescript-eslint/types';

jest.mock('../../src/referencer');
jest.mock('../../src/ScopeManager');

describe('ecma version mapping', () => {
  it("should map to 'esnext' when unsuported and new", () => {
    expectMapping(2042, 'esnext');
    expectMapping(42, 'esnext');
  });

  it("should map to 'es5' when unsuported and old", () => {
    expectMapping(2002, 'es5');
    expectMapping(2, 'es5');
  });

  it("should map to 'es{year}' when supported and >= 6", () => {
    expectMapping(2015, 'es2015');
    expectMapping(6, 'es2015');
    expectMapping(2020, 'es2020');
    expectMapping(11, 'es2020');
  });

  it("should map to 'es5' when 5 or 3", () => {
    expectMapping(5, 'es5');
    expectMapping(3, 'es5');
  });

  it("should map to 'es2018' when undefined", () => {
    expectMapping(undefined, 'es2018');
  });
});

const fakeNode = ({} as unknown) as TSESTree.Node;

function expectMapping(ecmaVersion: number | undefined, lib: Lib): void {
  (Referencer as jest.Mock).mockClear();
  analyze(fakeNode, { ecmaVersion: ecmaVersion as EcmaVersion });
  expect(Referencer).toHaveBeenCalledWith(
    expect.objectContaining({ lib: [lib] }),
    expect.any(Object),
  );
}
