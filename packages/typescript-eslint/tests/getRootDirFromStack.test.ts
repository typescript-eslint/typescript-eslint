import { getRootDirFromStack } from '../src/getRootDirFromStack';

describe(getRootDirFromStack, () => {
  it('returns undefined when no file path seems to be an ESLint config', () => {
    const actual = getRootDirFromStack(
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
    'returns the path to the config file when in a Unix system and its extension is %s',
    extension => {
      const actual = getRootDirFromStack(
        [
          `Error`,
          ` at file:///path/to/file/eslint.config.${extension}`,
          ' at ModuleJob.run',
          'at async NodeHfs.walk(...)',
        ].join('\n'),
      );

      expect(actual).toBe('/path/to/file/');
    },
  );
});
