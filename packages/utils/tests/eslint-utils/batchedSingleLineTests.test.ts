import { ESLintUtils } from '../../src';

describe('batchedSingleLineTests', () => {
  const FIXTURES = `
a
b
c
  `;
  const errors = [
    { messageId: 'someMessage1', line: 2 },
    { messageId: 'someMessage2', line: 3 },
    { messageId: 'someMessage3', line: 4 },
  ];
  const options = [{ optionOne: 'value' }];

  it('should work without options', () => {
    expect(
      ESLintUtils.batchedSingleLineTests({
        code: FIXTURES,
      }),
    ).toEqual([
      { code: 'a', errors: [] },
      { code: 'b', errors: [] },
      { code: 'c', errors: [] },
    ]);
  });

  it('should work with errors', () => {
    expect(
      ESLintUtils.batchedSingleLineTests({
        code: FIXTURES,
        errors,
      }),
    ).toEqual([
      { code: 'a', errors: [{ messageId: 'someMessage1', line: 1 }] },
      { code: 'b', errors: [{ messageId: 'someMessage2', line: 1 }] },
      { code: 'c', errors: [{ messageId: 'someMessage3', line: 1 }] },
    ]);
  });

  it('should work with all fields', () => {
    const filename = 'foo.ts';
    const parser = 'some-parser';

    expect(
      ESLintUtils.batchedSingleLineTests({
        code: FIXTURES,
        errors,
        options,
        parser,
        output: FIXTURES,
        filename,
      }),
    ).toEqual([
      {
        code: 'a',
        output: 'a',
        errors: [{ messageId: 'someMessage1', line: 1 }],
        parser,
        filename,
        options,
      },
      {
        code: 'b',
        output: 'b',
        errors: [{ messageId: 'someMessage2', line: 1 }],
        parser,
        filename,
        options,
      },
      {
        code: 'c',
        output: 'c',
        errors: [{ messageId: 'someMessage3', line: 1 }],
        parser,
        filename,
        options,
      },
    ]);
  });
});
