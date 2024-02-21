/* eslint-disable @typescript-eslint/explicit-function-return-type -- Fancy mocks */
import path from 'path';

import type { TypeScriptProjectService } from '../../src/create-program/createProjectService';
import type { ParseSettings } from '../../src/parseSettings';
import { useProgramFromProjectService } from '../../src/useProgramFromProjectService';

const mockCreateProjectProgram = jest.fn();

jest.mock('../../src/create-program/createProjectProgram', () => ({
  get createProjectProgram() {
    return mockCreateProjectProgram;
  },
}));

const currentDirectory = '/repos/repo';

function createMockProjectService() {
  const openClientFile = jest.fn();
  const service = {
    getDefaultProjectForFile: () => ({
      getLanguageService: () => ({
        getProgram: () => ({
          getSourceFile: () => ({}),
        }),
      }),
    }),
    getScriptInfo: () => ({}),
    host: {
      getCurrentDirectory: () => currentDirectory,
    },
    openClientFile,
  };

  return {
    service: service as typeof service & TypeScriptProjectService,
    openClientFile,
  };
}

const mockParseSettings = {
  filePath: 'path/PascalCaseDirectory/camelCaseFile.ts',
} as ParseSettings;

describe('useProgramFromProjectService', () => {
  it('passes an absolute, case-matching file path to service.openClientFile', () => {
    const { service } = createMockProjectService();

    useProgramFromProjectService(
      { allowDefaultProjectForFiles: undefined, service },
      mockParseSettings,
      false,
    );

    expect(service.openClientFile).toHaveBeenCalledWith(
      path.normalize('/repos/repo/path/PascalCaseDirectory/camelCaseFile.ts'),
      undefined,
      undefined,
      undefined,
    );
  });

  it('throws an error when hasFullTypeInformation is enabled and the file is both in the project service and allowDefaultProjectForFiles', () => {
    const { service } = createMockProjectService();

    service.openClientFile.mockReturnValue({ configFileName: 'tsconfig.json' });

    expect(() =>
      useProgramFromProjectService(
        { allowDefaultProjectForFiles: [mockParseSettings.filePath], service },
        mockParseSettings,
        true,
      ),
    ).toThrow(
      `${mockParseSettings.filePath} was included by allowDefaultProjectForFiles but also was found in the project service. Consider removing it from allowDefaultProjectForFiles.`,
    );
  });

  it('throws an error when hasFullTypeInformation is enabled and the file is neither in the project service nor allowDefaultProjectForFiles', () => {
    const { service } = createMockProjectService();

    service.openClientFile.mockReturnValue({});

    expect(() =>
      useProgramFromProjectService(
        { allowDefaultProjectForFiles: [], service },
        mockParseSettings,
        true,
      ),
    ).toThrow(
      `${mockParseSettings.filePath} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProjectForFiles.`,
    );
  });

  it('returns undefined when hasFullTypeInformation is disabled, the file is both in the project service and allowDefaultProjectForFiles, and the service does not have a matching program', () => {
    const { service } = createMockProjectService();

    service.openClientFile.mockReturnValue({ configFileName: 'tsconfig.json' });

    const actual = useProgramFromProjectService(
      { allowDefaultProjectForFiles: [mockParseSettings.filePath], service },
      mockParseSettings,
      false,
    );

    expect(actual).toBeUndefined();
  });

  it('returns a created program when hasFullTypeInformation is disabled, the file is both in the project service and allowDefaultProjectForFiles, and the service has a matching program', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    service.openClientFile.mockReturnValue({ configFileName: 'tsconfig.json' });
    mockCreateProjectProgram.mockReturnValue(program);

    const actual = useProgramFromProjectService(
      { allowDefaultProjectForFiles: [mockParseSettings.filePath], service },
      mockParseSettings,
      false,
    );

    expect(actual).toBe(program);
  });

  it('returns a created program when hasFullTypeInformation is disabled, the file is neither in the project service nor allowDefaultProjectForFiles, and the service has a matching program', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    service.openClientFile.mockReturnValue({});
    mockCreateProjectProgram.mockReturnValue(program);

    const actual = useProgramFromProjectService(
      { allowDefaultProjectForFiles: [], service },
      mockParseSettings,
      false,
    );

    expect(actual).toBe(program);
  });
});
