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
      'tseslint.config(): Config "my-config-2": Key "extends": Expected array to only contain objects at user-defined index 1.',
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
      'tseslint.config(): Config (anonymous): Key "extends": Expected array to only contain objects at user-defined index 1.',
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

  it.each([undefined, null, 'not a config object', 42])(
    'passes invalid arguments through unchanged',
    config => {
      expect(
        plugin.config(
          // @ts-expect-error purposely testing invalid values
          config,
        ),
      ).toStrictEqual([config]);
    },
  );
});
