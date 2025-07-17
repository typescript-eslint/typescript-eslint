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
        'at async NodeHfs.walk(...)',
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
          ' at file:///path/to/dir/eslint.config.js',
          ' at ModuleJob.run',
          'at async NodeHfs.walk(...)',
        ].join('\n'),
      );

      expect(actual).toBe('/path/to/dir');
    },
  );

  it.each(['cjs', 'cts', 'js', 'mjs', 'mts', 'ts'])(
    'returns the path to the config file when its extension is %s',
    extension => {
      const expected = isWindows ? 'C:\\path\\to\\dir' : '/path/to/dir';

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

  it("doesn't get tricked by a messed up by not-an-eslint.config.js", () => {
    const actual = getTSConfigRootDirFromStack(
      [
        `Error`,
        ' at file:///a/b/not-an-eslint.config.js',
        ' at ModuleJob.run',
        'at async NodeHfs.walk(...)',
      ].join('\n'),
    );

    expect(actual).toBeUndefined();
  });

  it.each(['cjs', 'cts', 'js', 'mjs', 'mts', 'ts'])(
    'correctly resolves the config file even when multiple path seps are present %s',
    extension => {
      const expected = isWindows ? 'C:\\path\\to\\dir' : '/path/to/dir';

      const actual = getTSConfigRootDirFromStack(
        [
          `Error`,
          ` at ${expected + path.sep + path.sep}eslint.config.${extension}}`,
          ' at ModuleJob.run',
          'at async NodeHfs.walk(...)',
        ].join('\n'),
      );

      expect(actual).toBe(expected);
    },
  );
});
