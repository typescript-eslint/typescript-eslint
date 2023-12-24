import { createProjectService } from '../../src/create-program/createProjectService';

describe('createProjectService', () => {
  it('sets allowDefaultProjectForFiles when options.allowDefaultProjectForFiles is defined', () => {
    const allowDefaultProjectForFiles = ['./*.js'];
    const settings = createProjectService(
      { allowDefaultProjectForFiles },
      undefined,
    );

    expect(settings.allowDefaultProjectForFiles).toBe(
      allowDefaultProjectForFiles,
    );
  });

  it('does not set allowDefaultProjectForFiles when options.allowDefaultProjectForFiles is not defined', () => {
    const settings = createProjectService(undefined, undefined);

    expect(settings.allowDefaultProjectForFiles).toBeUndefined();
  });
});
