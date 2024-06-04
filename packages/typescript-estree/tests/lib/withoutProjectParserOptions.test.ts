import { withoutProjectParserOptions } from '../../src';

describe('withoutProjectParserOptions', () => {
  it('removes all project parser options', () => {
    const without = withoutProjectParserOptions({
      EXPERIMENTAL_useProjectService: true,
      project: true,
    });
    expect(without.EXPERIMENTAL_useProjectService).toBeUndefined();
    expect(without.project).toBeUndefined();
  });
  it('leaves other parser options intact', () => {
    const without = withoutProjectParserOptions({
      EXPERIMENTAL_useProjectService: true,
      project: true,
      comment: true,
    });
    expect(without.comment).toEqual(true);
  });
});
