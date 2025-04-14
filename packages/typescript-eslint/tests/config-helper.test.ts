import type { TSESLint } from '@typescript-eslint/utils';

import plugin from '../src/index';

describe('config helper', () => {
  it('works without extends', () => {
    expect(
      plugin.config({
        files: ['file'],
        ignores: ['ignored'],
        rules: { rule: 'error' },
      }),
    ).toEqual([
      {
        files: ['file'],
        ignores: ['ignored'],
        rules: { rule: 'error' },
      },
    ]);
  });

  it('flattens extended configs', () => {
    expect(
      plugin.config({
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
        rules: { rule: 'error' },
      }),
    ).toEqual([
      { rules: { rule1: 'error' } },
      { rules: { rule2: 'error' } },
      { rules: { rule: 'error' } },
    ]);
  });

  it('flattens extended configs with files and ignores', () => {
    expect(
      plugin.config({
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
      }),
    ).toEqual([
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

    expect(() =>
      plugin.config(
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
      ),
    ).toThrow(
      'Your config at index 1, named "my-config-2", contains undefined ' +
        'extensions at the following indices: 0, 2',
    );
  });

  it('throws error without config name when some extensions are undefined', () => {
    const extension: TSESLint.FlatConfig.Config = { rules: { rule1: 'error' } };

    expect(() =>
      plugin.config(
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
      ),
    ).toThrow(
      'Your config at index 1 (anonymous) contains undefined extensions at ' +
        'the following indices: 0, 2',
    );
  });

  it('flattens extended configs with config name', () => {
    expect(
      plugin.config({
        extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule: 'error' },
      }),
    ).toEqual([
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
      plugin.config({
        extends: [
          { name: 'extension-1', rules: { rule1: 'error' } },
          { rules: { rule2: 'error' } },
        ],
        files: ['common-file'],
        ignores: ['common-ignored'],
        rules: { rule: 'error' },
      }),
    ).toEqual([
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
      plugin.config({
        extends: [
          { name: 'extension-1', rules: { rule1: 'error' } },
          { rules: { rule2: 'error' } },
        ],
        files: ['common-file'],
        ignores: ['common-ignored'],
        name: 'my-config',
        rules: { rule: 'error' },
      }),
    ).toEqual([
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
      plugin.config(
        { rules: { rule1: 'error' } },
        [{ rules: { rule2: 'error' } }],
        [[{ rules: { rule3: 'error' } }]],
        [[[{ rules: { rule4: 'error' } }]]],
        [[[[{ rules: { rule5: 'error' } }]]]],
      ),
    ).toEqual([
      { rules: { rule1: 'error' } },
      { rules: { rule2: 'error' } },
      { rules: { rule3: 'error' } },
      { rules: { rule4: 'error' } },
      { rules: { rule5: 'error' } },
    ]);
  });

  it('allows nested arrays in extends', () => {
    expect(
      plugin.config({
        extends: [
          { rules: { rule1: 'error' } },
          [{ rules: { rule2: 'error' } }],
          [[{ rules: { rule3: 'error' } }]],
          [[[{ rules: { rule4: 'error' } }]]],
          [[[[{ rules: { rule5: 'error' } }]]]],
        ],
        rules: { rule: 'error' },
      }),
    ).toEqual([
      { rules: { rule1: 'error' } },
      { rules: { rule2: 'error' } },
      { rules: { rule3: 'error' } },
      { rules: { rule4: 'error' } },
      { rules: { rule5: 'error' } },
      { rules: { rule: 'error' } },
    ]);
  });

  it('does not create global ignores in extends', () => {
    const configWithIgnores = plugin.config({
      extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
      ignores: ['ignored'],
    });

    expect(configWithIgnores).toEqual([
      { ignores: ['ignored'], rules: { rule1: 'error' } },
      { ignores: ['ignored'], rules: { rule2: 'error' } },
    ]);
    expect(configWithIgnores).not.toContainEqual(
      // Should not create global ignores
      { ignores: ['ignored'] },
    );
  });

  it('creates noop config in extends', () => {
    const configWithMetadata = plugin.config({
      extends: [{ rules: { rule1: 'error' } }, { rules: { rule2: 'error' } }],
      files: ['file'],
      ignores: ['ignored'],
      name: 'my-config',
    });

    expect(configWithMetadata).toEqual([
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
      plugin.config({
        extends: [{ rules: { rule1: 'error' } }, {}],
        ignores: ['ignored'],
      }),
    ).toEqual([
      { ignores: ['ignored'], rules: { rule1: 'error' } },
      // Should not create global ignores
      {},
    ]);
  });
});
