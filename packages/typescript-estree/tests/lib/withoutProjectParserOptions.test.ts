import type { TSESTreeOptions } from '../../src';
import { withoutProjectParserOptions } from '../../src';

describe('withoutProjectParserOptions', () => {
  it('removes only project parser options', () => {
    const without = withoutProjectParserOptions({
      comment: true,
      EXPERIMENTAL_useProjectService: true,
      project: true,
      projectService: true,
    } as TSESTreeOptions);
    expect(without).toEqual({
      comment: true,
    });
  });
});
