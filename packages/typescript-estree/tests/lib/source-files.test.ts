import * as ts from 'typescript';

import { isSourceFile } from '../../src/source-files';

describe('isSourceFile', () => {
  it.each([null, undefined, {}, { getFullText: (): string => '', text: '' }])(
    `returns false when given %j`,
    input => {
      expect(isSourceFile(input)).toBe(false);
    },
  );

  it('returns true when given a real source file', () => {
    const input = ts.createSourceFile('test.ts', '', ts.ScriptTarget.ESNext);

    expect(isSourceFile(input)).toBe(true);
  });
});
