import * as ts from 'typescript';

import { getCodeText, isSourceFile } from '../../src/source-files';

describe(isSourceFile, () => {
  it.for([
    [null],
    [undefined],
    [{}],
    [{ getFullText: (): string => '', text: '' }],
  ] as const)('returns false when given %o', ([input], { expect }) => {
    expect(isSourceFile(input)).toBe(false);
  });

  it('returns true when given a real source file', () => {
    const input = ts.createSourceFile('test.ts', '', ts.ScriptTarget.ESNext);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- intentionally testing that the types match reality
    expect(isSourceFile(input)).toBe(true);
  });
});

describe(getCodeText, () => {
  it('returns the code when code is provided as a string', () => {
    const code = '// Hello world';

    expect(getCodeText(code)).toBe(code);
  });

  it('returns the code when code is provided as a source file', () => {
    const code = '// Hello world';
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.ESNext,
    );

    expect(getCodeText(sourceFile)).toBe(code);
  });
});
