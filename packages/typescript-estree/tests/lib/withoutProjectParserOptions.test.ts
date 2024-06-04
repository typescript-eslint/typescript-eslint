import { withoutProjectParserOptions } from '../../src';

describe('withoutProjectParserOptions', () => {
  it('removes only project parser options', () => {
    const without = withoutProjectParserOptions({
      comment: true,
      EXPERIMENTAL_useProjectService: true,
      project: true,
    });
    expect(without).toEqual({
      comment: true,
    });
  });
});
