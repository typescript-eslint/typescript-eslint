import type { TSESLint } from '@typescript-eslint/utils';

import tseslint from '../src/index.js';

describe('config helper', () => {
  it('works without extends', () => {
    expect(
      tseslint.config({
        files: ['file'],
        ignores: ['ignored'],
        rules: { rule: 'error' },
      }),
    ).toStrictEqual([
      {
        files: ['file'],
        ignores: ['ignored'],
        rules: { rule: 'error' },
      },
    ]);
  });

  it('flattens extended configs', () => {
    expect(
      tseslint.config({
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
        rules: { rule: 'error' },
      }),
    ).toStrictEqual([
      { rules: { rule1: 'error' } },
      { rules: { rule2: 'error' } },
      { rules: { rule: 'error' } },
    ]);
  });

  it('flattens extended configs with files and ignores', () => {
    expect(
      tseslint.config({
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
      }),
    ).toStrictEqual([
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule1: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule2: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
      },
    ]);
  });

  it('throws error containing config name when some extensions are undefined', () => {
    const extension: TSESLint.FlatConfig.Config = { rules: { rule1: 'error' } };

    expect(() => {
      tseslint.config(
        {
          extends: [extension],
          files: ['common-file'],
          ignores: ['common-ignored'],
          name: 'my-config-1',
          rules: { rule: 'error' },
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          extends: [undefined as any, extension, undefined as any],
          files: ['common-file'],
          ignores: ['common-ignored'],
          name: 'my-config-2',
          rules: { rule: 'error' },
        },
      );
    }).toThrow(
      'tseslint.config(): Config at index 1, named "my-config-2", contains non-object ' +
        'extensions at the following indices: 0, 2',
    );
  });

  it('throws error without config name when some extensions are undefined', () => {
    const extension: TSESLint.FlatConfig.Config = { rules: { rule1: 'error' } };

    expect(() => {
      tseslint.config(
        {
          extends: [extension],
          files: ['common-file'],
          ignores: ['common-ignored'],
          name: 'my-config-1',
          rules: { rule: 'error' },
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          extends: [undefined as any, extension, undefined as any],
          files: ['common-file'],
          ignores: ['common-ignored'],
          rules: { rule: 'error' },
        },
      );
    }).toThrow(
      'tseslint.config(): Config at index 1 (anonymous) contains non-object extensions at ' +
        'the following indices: 0, 2',
    );
  });

  it('flattens extended configs with config name', () => {
    expect(
      tseslint.config({
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule: 'error' },
      }),
    ).toStrictEqual([
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule1: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule2: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule: 'error' },
      },
    ]);
  });

  it('flattens extended configs with names if base config is unnamed', () => {
    expect(
      tseslint.config({
        extends: [
          { name: 'extension-1', rules: { rule1: 'error' } },
          { rules: { rule2: 'error' } },
        ],
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
      }),
    ).toStrictEqual([
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'extension-1',
        rules: { rule1: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule2: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
      },
    ]);
  });

  it('merges config items names', () => {
    expect(
      tseslint.config({
        extends: [
          { name: 'extension-1', rules: { rule1: 'error' } },
          { rules: { rule2: 'error' } },
        ],
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule: 'error' },
      }),
    ).toStrictEqual([
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config__extension-1',
        rules: { rule1: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule2: 'error' },
      },
      {
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule: 'error' },
      },
    ]);
  });

  it('allows nested arrays in the config function', () => {
    expect(
      tseslint.config(
        { rules: { rule1: 'error' } },
        [{ rules: { rule2: 'error' } }],
        [[{ rules: { rule3: 'error' } }]],
        [[[{ rules: { rule4: 'error' } }]]],
        [[[[{ rules: { rule5: 'error' } }]]]],
      ),
    ).toStrictEqual([
      { rules: { rule1: 'error' } },
      { rules: { rule2: 'error' } },
      { rules: { rule3: 'error' } },
      { rules: { rule4: 'error' } },
      { rules: { rule5: 'error' } },
    ]);
  });

  it('allows nested arrays in extends', () => {
    expect(
      tseslint.config({
        extends: [
          { rules: { rule1: 'error' } },
          [{ rules: { rule2: 'error' } }],
          [[{ rules: { rule3: 'error' } }]],
          [[[{ rules: { rule4: 'error' } }]]],
          [[[[{ rules: { rule5: 'error' } }]]]],
        ],
        rules: { rule: 'error' },
      }),
    ).toStrictEqual([
      { rules: { rule1: 'error' } },
      { rules: { rule2: 'error' } },
      { rules: { rule3: 'error' } },
      { rules: { rule4: 'error' } },
      { rules: { rule5: 'error' } },
      { rules: { rule: 'error' } },
    ]);
  });

  it('does not create global ignores in extends', () => {
    const configWithIgnores = tseslint.config({
      extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
      ignores: ['ignored'],
    });

    expect(configWithIgnores).toStrictEqual([
      { ignores: ['ignored'], rules: { rule1: 'error' } },
      { ignores: ['ignored'], rules: { rule2: 'error' } },
    ]);
    expect(configWithIgnores).not.toContainEqual(
      // Should not create global ignores
      { ignores: ['ignored'] },
    );
  });

  it('creates noop config in extends', () => {
    const configWithMetadata = tseslint.config({
      extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
      files: ['file'],
      ignores: ['ignored'],
      name: 'my-config',
    });

    expect(configWithMetadata).toStrictEqual([
      {
        files: ['file'],
        ignores: ['ignored'],
        name: 'my-config',
        rules: { rule1: 'error' },
      },
      {
        files: ['file'],
        ignores: ['ignored'],
        name: 'my-config',
        rules: { rule2: 'error' },
      },
      // it would also be ok for this not to be present, but we want to align
      // with the eslint `defineConfig()` behavior.
      {
        files: ['file'],
        ignores: ['ignored'],
        name: 'my-config',
      },
    ]);
  });

  it('does not create global ignores when extending empty configs', () => {
    expect(
      tseslint.config({
        extends: [{ rules: { rule1: 'error' } }, {}],
        ignores: ['ignored'],
      }),
    ).toStrictEqual([
      { ignores: ['ignored'], rules: { rule1: 'error' } },
      // Should not create global ignores
      {},
    ]);
  });

  it('handles name field when global-ignoring in extension', () => {
    expect(
      tseslint.config({
        extends: [{ ignores: ['files/**/*'], name: 'global-ignore-stuff' }],
        ignores: ['ignored'],
      }),
    ).toStrictEqual([{ ignores: ['files/**/*'], name: 'global-ignore-stuff' }]);
  });

  it('throws error when extends is not an array', () => {
    expect(() => {
      tseslint.config({
        // @ts-expect-error purposely testing invalid values
        extends: 42,
      });
    }).toThrow(
      "tseslint.config(): Config at index 0 (anonymous) has an 'extends' property that is not an array.",
    );
  });

  it.for([[undefined], [null], ['not a config object'], [42]] as const)(
    'passes invalid arguments through unchanged',
    ([config], { expect }) => {
      expect(
        tseslint.config(
          // @ts-expect-error purposely testing invalid values
          config,
        ),
      ).toStrictEqual([config]);
    },
  );

  it('gives a special error message for string extends', () => {
    expect(() => {
      tseslint.config({
        // @ts-expect-error purposely testing invalid values
        extends: ['some-string'],
      });
    }).toThrow(
      'tseslint.config(): Config at index 0 (anonymous) has an \'extends\' array that contains a string ("some-string") at index 0. ' +
        "This is a feature of eslint's `defineConfig()` helper and is not supported by typescript-eslint. " +
        'Please provide a config object instead.',
    );
  });

  it('strips nullish extends arrays from the config object', () => {
    expect(
      tseslint.config({
        // @ts-expect-error purposely testing invalid values
        extends: null,
        files: ['files'],
      }),
    ).toStrictEqual([{ files: ['files'] }]);
  });

  it('complains when given an object with an invalid name', () => {
    expect(() => {
      tseslint.config({
        extends: [],
        // @ts-expect-error purposely testing invalid values
        name: 42,
      });
    }).toThrow(
      "tseslint.config(): Config at index 0 has a 'name' property that is not a string.",
    );
  });

  it('basePath works with unextended config', () => {
    expect(
      tseslint.config({
        basePath: 'base/path',
        rules: { rule1: 'error' },
      }),
    ).toStrictEqual([
      {
        basePath: 'base/path',
        rules: { rule1: 'error' },
      },
    ]);
  });

  it('basePath works with extended config', () => {
    expect(
      tseslint.config({
        basePath: 'base/path',
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
      }),
    ).toStrictEqual([
      {
        basePath: 'base/path',
        rules: { rule1: 'error' },
      },
      {
        basePath: 'base/path',
        rules: { rule2: 'error' },
      },
    ]);
  });

  it('basePath cannot be used in an extension', () => {
    expect(() => {
      tseslint.config({
        extends: [{ rules: { rule1: 'error' }, basePath: 'base/path' }],
      });
    }).toThrow(
      "tseslint.config(): Config at index 0 (anonymous) has an 'extends' array that contains a config with a 'basePath' property at index 0. 'basePath' in `extends' is not allowed.",
    );
  });
});
