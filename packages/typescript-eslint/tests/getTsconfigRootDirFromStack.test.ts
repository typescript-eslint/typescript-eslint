import { getTSConfigRootDirFromStack } from '../src/getTSConfigRootDirFromStack';
import * as normalFolder from './path-test-fixtures/tsconfigRootDirInference-normal/normal-folder/eslint.config.cjs';
import * as notEslintConfig from './path-test-fixtures/tsconfigRootDirInference-not-eslint-config/not-an-eslint.config.cjs';
import * as folderThatHasASpace from './path-test-fixtures/tsconfigRootDirInference-space/folder that has a space/eslint.config.cjs';

const isWindows = process.platform === 'win32';

describe(getTSConfigRootDirFromStack, () => {
  it('does stack analysis right for normal folder', () => {
    expect(normalFolder.get()).toBe(normalFolder.dirname());
  });

  it('does stack analysis right for a file that gives a file:// URL as its name', () => {
    vi.spyOn(Error, 'captureStackTrace').mockImplementationOnce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (target: any, _constructorOpt) => {
        target.stack = [
          {
            getFileName() {
              return !isWindows
                ? 'file:///a/b/eslint.config.mts'
                : 'file:///F:/a/b/eslint.config.mts';
            },
          },
        ];
      },
    );

    const inferredTsconfigRootDir = getTSConfigRootDirFromStack();

    expect(inferredTsconfigRootDir).toBe(!isWindows ? '/a/b' : 'F:\\a\\b');
  });

  it('does stack analysis right for folder that has a space', () => {
    expect(folderThatHasASpace.get()).toBe(folderThatHasASpace.dirname());
  });

  it("doesn't get tricked by a file that is not an ESLint config", () => {
    expect(notEslintConfig.get()).toBeUndefined();
  });

  it('should work in the presence of a messed up strack trace string', () => {
    const prepareStackTrace = Error.prepareStackTrace;
    const dummyFunction = () => {};
    Error.prepareStackTrace = dummyFunction;
    expect(new Error().stack).toBeUndefined();
    expect(normalFolder.get()).toBe(normalFolder.dirname());
    expect(Error.prepareStackTrace).toBe(dummyFunction);
    Error.prepareStackTrace = prepareStackTrace;
  });

  it.runIf(isWindows)(
    'works when jiti gives non-normalized stack traces on windows',
    () => {
      vi.spyOn(Error, 'captureStackTrace').mockImplementationOnce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (target: any, _constructorOpt) => {
          target.stack = [
            {
              getFileName() {
                return 'F:/a/b/eslint.config.ts';
              },
            },
          ];
        },
      );

      const inferredTsconfigRootDir = getTSConfigRootDirFromStack();

      expect(inferredTsconfigRootDir).toBe('F:\\a\\b');
    },
  );
});
