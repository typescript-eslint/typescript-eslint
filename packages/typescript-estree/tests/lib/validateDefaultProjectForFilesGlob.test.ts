import { validateDefaultProjectForFilesGlob } from '../../src/create-program/validateDefaultProjectForFilesGlob.js';

describe(validateDefaultProjectForFilesGlob, () => {
  it('does not throw when options.allowDefaultProject is an empty array', () => {
    expect(() => validateDefaultProjectForFilesGlob([])).not.toThrow();
  });

  it('does not throw when options.allowDefaultProject contains a non-** glob', () => {
    expect(() => validateDefaultProjectForFilesGlob(['*.js'])).not.toThrow();
  });

  it('throws when options.allowDefaultProject contains a * glob', () => {
    expect(() => validateDefaultProjectForFilesGlob(['*'])).toThrow(
      /allowDefaultProject contains the overly wide '\*'\./,
    );
  });

  it('throws when options.allowDefaultProject contains a ** glob', () => {
    expect(() => validateDefaultProjectForFilesGlob(['**/*.js'])).toThrow(
      /allowDefaultProject glob '\*\*\/\*\.js' contains a disallowed '\*\*'\./,
    );
  });
});
