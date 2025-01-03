import { filePathToNamespace } from '../src/filePathToNamespace';

describe('filePathToNamespace', () => {
  test.each([
    [
      'node_modules/@typescript-eslint/example/dist/index.js',
      'typescript-eslint:example:index',
    ],
    [
      'node_modules/@typescript-eslint/example/dist/index.cjs',
      'typescript-eslint:example:index',
    ],
    [
      'node_modules/@typescript-eslint/example/dist/index.mjs',
      'typescript-eslint:example:index',
    ],
    [
      'node_modules/@typescript-eslint/example/dist/abc/def.js',
      'typescript-eslint:example:abc:def',
    ],
    [
      'node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/resolveProjectList.js',
      'typescript-eslint:typescript-estree:parseSettings:resolveProjectList',
    ],
  ])('%s becomes %s', (filePath, expected) => {
    expect(filePathToNamespace(filePath)).toBe(expected);
  });
});
