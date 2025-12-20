import { validateDefaultProjectForFilesGlob } from '../../src/create-program/validateDefaultProjectForFilesGlob.js';

describe(validateDefaultProjectForFilesGlob, () => {
  it('does not throw when options.allowDefaultProject is an empty array', () => {
    expect(() => validateDefaultProjectForFilesGlob([])).not.toThrowError();
  });

  it('does not throw when options.allowDefaultProject contains a non-** glob', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob(['*.js']),
    ).not.toThrowError();
  });

  it('throws when options.allowDefaultProject contains a * glob', () => {
    expect(() => validateDefaultProjectForFilesGlob(['*'])).toThrowError(
      /allowDefaultProject contains the overly wide '\*'\./,
    );
  });

  it('throws when options.allowDefaultProject contains a ** glob', () => {
    expect(() => validateDefaultProjectForFilesGlob(['**/*.js'])).toThrowError(
      /allowDefaultProject glob '\*\*\/\*\.js' contains a disallowed '\*\*'\./,
    );
  });
});
