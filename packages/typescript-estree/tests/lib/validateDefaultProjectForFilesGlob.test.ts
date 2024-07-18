import { validateDefaultProjectForFilesGlob } from '../../src/create-program/validateDefaultProjectForFilesGlob';

describe('validateDefaultProjectForFilesGlob', () => {
  it('does not throw when options.allowDefaultProject is an empty array', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob({ allowDefaultProject: [] }),
    ).not.toThrow();
  });

  it('does not throw when options.allowDefaultProject contains a non-** glob', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob({
        allowDefaultProject: ['./*.js'],
      }),
    ).not.toThrow();
  });

  it('throws when options.allowDefaultProject contains a * glob', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob({
        allowDefaultProject: ['*'],
      }),
    ).toThrow(/allowDefaultProject contains the overly wide '\*'\./);
  });

  it('throws when options.allowDefaultProject contains a ** glob', () => {
    expect(() =>
      validateDefaultProjectForFilesGlob({
        allowDefaultProject: ['**/*.js'],
      }),
    ).toThrow(
      /allowDefaultProject glob '\*\*\/\*\.js' contains a disallowed '\*\*'\./,
    );
  });
});
