import type { TSESTreeOptions } from '../../src';

import { withoutProjectParserOptions } from '../../src';

describe(withoutProjectParserOptions, () => {
  it('removes only project parser options', () => {
    const options = {
      comment: true,
      EXPERIMENTAL_useProjectService: true,
      project: true,
      projectService: true,
    } as TSESTreeOptions;

    const without = withoutProjectParserOptions(options);

    expect(without).toEqual({
      comment: true,
    });
  });

  it('allows an alternate type extending from TSESTreeOptions', () => {
    const without = withoutProjectParserOptions({
      comment: true,
      other: true,
      project: true,
      projectService: true,
    });

    expect(without).toEqual({
      comment: true,
      other: true,
    });
  });
});
