import { validateDefaultProjectForFilesGlob } from '../../src/create-program/validateDefaultProjectForFilesGlob';

describe('validateDefaultProjectForFilesGlob', () => {
  it('does not throw when options is falsy', () => {
    expect(() => validateDefaultProjectForFilesGlob(false)).not.toThrow();
  });

  it('does not throw when options.allowDefaultProjectForFiles is an empty array', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob({ allowDefaultProjectForFiles: [] }),
    ).not.toThrow();
  });

  it('does not throw when options.allowDefaultProjectForFiles contains a non-** glob', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob({
        allowDefaultProjectForFiles: ['./*.js'],
      }),
    ).not.toThrow();
  });

  it('throws when options.allowDefaultProjectForFiles contains a ** glob', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob({
        allowDefaultProjectForFiles: ['**/*.js'],
      }),
    ).toThrow(
      /allowDefaultProjectForFiles glob '\*\*\/\*\.js' contains a disallowed '\*\*'\./,
    );
  });
});
