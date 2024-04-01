import * as ts from 'typescript';

import { createProjectService } from '../../src/create-program/createProjectService';

const mockReadConfigFile = jest.fn();

jest.mock('typescript/lib/tsserverlibrary', () => ({
  ...jest.requireActual('typescript/lib/tsserverlibrary'),
  readConfigFile: mockReadConfigFile,
}));

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

  it('throws an error when options.defaultProject is set and the readConfigFile returns an error', () => {
    mockReadConfigFile.mockReturnValue({
      error: {
        category: ts.DiagnosticCategory.Error,
        code: 1000,
      },
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProjectForFiles: ['file.js'],
          defaultProject: './tsconfig.json',
        },
        undefined,
      ),
    ).toThrow(
      /Could not read default project '\.\/tsconfig.json': error TS1000/,
    );
  });

  it('throws an error when options.defaultProject is set and the readConfigFile throws an error', () => {
    mockReadConfigFile.mockImplementation(() => {
      throw new Error('Oh no!');
    });

    expect(() =>
      createProjectService(
        {
          allowDefaultProjectForFiles: ['file.js'],
          defaultProject: './tsconfig.json',
        },
        undefined,
      ),
    ).toThrow("Could not parse default project './tsconfig.json': Oh no!");
  });
});
