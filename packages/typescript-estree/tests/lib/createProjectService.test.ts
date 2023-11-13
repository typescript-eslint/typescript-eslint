import { createProjectService } from '../../src/create-program/createProjectService';

describe('createProjectService', () => {
  it('sets allowDefaultProjectForFiles to a populated Set when options.allowDefaultProjectForFiles is defined', () => {
    const allowDefaultProjectForFiles = ['./*.js'];
    const settings = createProjectService(
      { allowDefaultProjectForFiles },
      __dirname,
    );

    expect(settings.allowDefaultProjectForFiles.size).toBe(1);
  });

  it('sets allowDefaultProjectForFiles to an empty Set when options.allowDefaultProjectForFiles is not defined', () => {
    const settings = createProjectService(undefined, __dirname);

    expect(settings.allowDefaultProjectForFiles.size).toBe(0);
  });
});
