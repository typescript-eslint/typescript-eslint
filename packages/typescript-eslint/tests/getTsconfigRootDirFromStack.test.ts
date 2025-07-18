import path from 'node:path';

import { getTSConfigRootDirFromStack } from '../src/getTSConfigRootDirFromStack';

const isWindows = process.platform === 'win32';

describe(getTSConfigRootDirFromStack, () => {
  it('returns undefined when no file path seems to be an ESLint config', () => {
    const actual = getTSConfigRootDirFromStack(
      [
        `Error`,
        ' at file:///other.config.js',
        ' at ModuleJob.run',
        'at NodeHfs.walk(...)',
      ].join('\n'),
    );

    expect(actual).toBeUndefined();
  });

  it.runIf(!isWindows)(
    'returns a Posix config file path when a file:// path to an ESLint config is in the stack',
    () => {
      const actual = getTSConfigRootDirFromStack(
        [
          `Error`,
          ' at file:///path/to/file/eslint.config.js',
          ' at ModuleJob.run',
          'at async NodeHfs.walk(...)',
        ].join('\n'),
      );

      expect(actual).toBe('/path/to/file/');
    },
  );

  it.each(['cjs', 'cts', 'js', 'mjs', 'mts', 'ts'])(
    'returns the path to the config file when its extension is %s',
    extension => {
      const expected = isWindows ? 'C:\\path\\to\\file\\' : '/path/to/file/';

      const actual = getTSConfigRootDirFromStack(
        [
          `Error`,
          ` at ${path.join(expected, `eslint.config.${extension}`)}`,
          ' at ModuleJob.run',
          'at async NodeHfs.walk(...)',
        ].join('\n'),
      );

      expect(actual).toBe(expected);
    },
  );

  it('returns the full path when it contains spaces', () => {
    const actual = getTSConfigRootDirFromStack(
      [
        `Error`,
        ` at /path/with space/to/dir/eslint.config.ts`,
        ' at ModuleJob.run',
      ].join('\n'),
    );

    expect(actual).toBe('/path/with space/to/dir/');
  });

  it('returns the full path when it contains spaces after an async import', () => {
    const actual = getTSConfigRootDirFromStack(
      [
        `Error`,
        ` at async /path/with space/to/dir/eslint.config.ts`,
        ' at ModuleJob.run',
      ].join('\n'),
    );

    expect(actual).toBe('/path/with space/to/dir/');
  });
});
