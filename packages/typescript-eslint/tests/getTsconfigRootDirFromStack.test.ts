import path from 'node:path';

import { getTsconfigRootDirFromStack } from '../src/getTsconfigRootDirFromStack';

describe(getTsconfigRootDirFromStack, () => {
  it('returns undefined when no file path seems to be an ESLint config', () => {
    const actual = getTsconfigRootDirFromStack(
      [
        `Error`,
        ' at file:///index.js',
        ' at ModuleJob.run',
        'at async NodeHfs.walk(...)',
      ].join('\n'),
    );

    expect(actual).toBeUndefined();
  });

  it.each(['cjs', 'cts', 'js', 'mjs', 'mts', 'ts'])(
    'returns the path to the config file when in a Posix system and its extension is %s',
    extension => {
      const expected =
        process.platform === 'win32'
          ? 'C:\\path\\to\\file\\'
          : '/path/to/file/';

      const actual = getTsconfigRootDirFromStack(
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
});
