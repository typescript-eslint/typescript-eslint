import { getTSConfigRootDirFromV8Api } from '../src/getTSConfigRootDirFromStack';
import * as normalFolder from './path-test-fixtures/tsconfigRootDirInference-normal/normal-folder/eslint.config.cjs';
import * as notEslintConfig from './path-test-fixtures/tsconfigRootDirInference-not-eslint-config/not-an-eslint.config.cjs';
import * as folderThatHasASpace from './path-test-fixtures/tsconfigRootDirInference-space/folder that has a space/eslint.config.cjs';

describe(getTSConfigRootDirFromV8Api, () => {
  it('does stack analysis right for normal folder', () => {
    expect(normalFolder.get()).toBe(normalFolder.dirname());
  });

  it('does stack analysis right for folder that has a space', () => {
    expect(folderThatHasASpace.get()).toBe(folderThatHasASpace.dirname());
  });

  it("doesn't get tricked by a file that is not an ESLint config", () => {
    expect(notEslintConfig.get()).toBeUndefined();
  });
});
