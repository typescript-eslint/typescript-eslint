/* eslint-disable @typescript-eslint/explicit-function-return-type -- Fancy mocks */
import path from 'path';

import type {
  ProjectServiceSettings,
  TypeScriptProjectService,
} from '../../src/create-program/createProjectService';
import type { ParseSettings } from '../../src/parseSettings';
import { useProgramFromProjectService } from '../../src/useProgramFromProjectService';

const mockCreateProjectProgram = jest.fn();

jest.mock('../../src/create-program/createProjectProgram', () => ({
  get createProjectProgram() {
    return mockCreateProjectProgram;
  },
}));

const mockGetProgram = jest.fn();

const currentDirectory = '/repos/repo';

function createMockProjectService() {
  const openClientFile = jest.fn();
  const service = {
    getDefaultProjectForFile: () => ({
      getLanguageService: () => ({
        getProgram: mockGetProgram,
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

const createProjectServiceSettings = <
  T extends Partial<ProjectServiceSettings>,
>(
  settings: T,
) => ({
  maximumDefaultProjectFileMatchCount: 8,
  ...settings,
});

describe('useProgramFromProjectService', () => {
  it('passes an absolute, case-matching file path to service.openClientFile', () => {
    const { service } = createMockProjectService();

    useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProjectForFiles: undefined,
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
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

    service.openClientFile.mockReturnValueOnce({
      configFileName: 'tsconfig.json',
    });

    expect(() =>
      useProgramFromProjectService(
        {
          allowDefaultProjectForFiles: [mockParseSettings.filePath],
          maximumDefaultProjectFileMatchCount: 8,
          service,
        },
        mockParseSettings,
        true,
        new Set(),
      ),
    ).toThrow(
      `${mockParseSettings.filePath} was included by allowDefaultProjectForFiles but also was found in the project service. Consider removing it from allowDefaultProjectForFiles.`,
    );
  });

  it('throws an error when hasFullTypeInformation is enabled and the file is neither in the project service nor allowDefaultProjectForFiles', () => {
    const { service } = createMockProjectService();

    service.openClientFile.mockReturnValueOnce({});

    expect(() =>
      useProgramFromProjectService(
        createProjectServiceSettings({
          allowDefaultProjectForFiles: [],
          service,
        }),
        mockParseSettings,
        true,
        new Set(),
      ),
    ).toThrow(
      `${mockParseSettings.filePath} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProjectForFiles.`,
    );
  });

  it('throws an error when called more than the maximum allowed file count', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({});

    expect(() =>
      useProgramFromProjectService(
        createProjectServiceSettings({
          allowDefaultProjectForFiles: [mockParseSettings.filePath],
          maximumDefaultProjectFileMatchCount: 2,
          service,
        }),
        mockParseSettings,
        true,
        new Set(['a', 'b']),
      ),
    ).toThrow(`Too many files (>2) have matched the default project.

Having many files run with the default project is known to cause performance issues and slow down linting.

See https://typescript-eslint.io/troubleshooting/#allowdefaultprojectforfiles-glob-too-wide

Matching files:
- a
- b
- /repos/repo/path/PascalCaseDirectory/camelCaseFile.ts

If you absolutely need more files included, set parserOptions.EXPERIMENTAL_useProjectService.maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING to a larger value.
`);
  });

  it('returns undefined when hasFullTypeInformation is disabled, the file is both in the project service and allowDefaultProjectForFiles, and the service does not have a matching program', () => {
    const { service } = createMockProjectService();

    mockGetProgram.mockReturnValueOnce(undefined);

    service.openClientFile.mockReturnValueOnce({
      configFileName: 'tsconfig.json',
    });

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProjectForFiles: [mockParseSettings.filePath],
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBeUndefined();
  });

  it('returns a created program when hasFullTypeInformation is disabled, the file is both in the project service and allowDefaultProjectForFiles, and the service has a matching program', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({
      configFileName: 'tsconfig.json',
    });
    mockCreateProjectProgram.mockReturnValueOnce(program);

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProjectForFiles: [mockParseSettings.filePath],
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBe(program);
  });

  it('returns a created program when hasFullTypeInformation is disabled, the file is neither in the project service nor allowDefaultProjectForFiles, and the service has a matching program', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({});
    mockCreateProjectProgram.mockReturnValueOnce(program);

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProjectForFiles: [],
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBe(program);
  });
});
