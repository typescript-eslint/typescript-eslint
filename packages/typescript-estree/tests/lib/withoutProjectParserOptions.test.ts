import type { TSESTreeOptions } from '../../src/index.js';

import { withoutProjectParserOptions } from '../../src/index.js';

describe(withoutProjectParserOptions, () => {
  it('removes only project parser options', () => {
    const options = {
      comment: true,
      EXPERIMENTAL_useProjectService: true,
      project: true,
      projectService: true,
    } as TSESTreeOptions;

    const without = withoutProjectParserOptions(options);

    expect(without).toStrictEqual({
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

    expect(without).toStrictEqual({
      comment: true,
      other: true,
    });
  });
});
