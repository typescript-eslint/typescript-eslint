/* eslint-disable @typescript-eslint/explicit-function-return-type -- Fancy mocks */
import path from 'path';
import * as ts from 'typescript';

import type {
  ProjectServiceSettings,
  TypeScriptProjectService,
} from '../../src/create-program/createProjectService';
import type { ParseSettings } from '../../src/parseSettings';
import { useProgramFromProjectService } from '../../src/useProgramFromProjectService';

const mockCreateNoProgram = jest.fn();

jest.mock('../../src/create-program/createSourceFile', () => ({
  get createNoProgram() {
    return mockCreateNoProgram;
  },
}));

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
  const setHostConfiguration = jest.fn();
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
    setHostConfiguration,
  };

  return {
    service: service as typeof service & TypeScriptProjectService,
    openClientFile,
  };
}

const mockFileName = 'camelCaseFile.ts';

const mockParseSettings = {
  filePath: `path/PascalCaseDirectory/${mockFileName}`,
  extraFileExtensions: [] as readonly string[],
} as ParseSettings;

const createProjectServiceSettings = <
  T extends Partial<ProjectServiceSettings>,
>(
  settings: T,
) => ({
  maximumDefaultProjectFileMatchCount: 8,
  ...settings,
});

// if hasFullTypeInformation is true:
//  do openClientFileFromProjectService
//  ✅ did use the isDefaultProjectAllowed boolean - in openClientFileFromProjectService, to make sure not double-included

// if hasFullTypeInformation is false and isDefaultProjectAllowed is true:
//  don't openClientFileFromProjectService
//  ✅ did use the isDefaultProjectAllowed boolean - in the if (!... && !...) { createNoProgramWithProjectService check
//  do

// if hasFullTypeInformation is false and isDefaultProjectAllowed is false:
//  ✅ did use the isDefaultProjectAllowed boolean - in the if (!... && !...) { createNoProgramWithProjectService check
// do createNoProgramWithProjectService
//  - which still opens the file if service.getScriptInfo knows of it

describe('useProgramFromProjectService', () => {
  it('creates a standalone AST with no program when hasFullTypeInformation is false', () => {
    const { service } = createMockProjectService();

    const stubASTAndNoProgram = {
      ast: ts.createSourceFile(mockFileName, '', ts.ScriptTarget.Latest),
      program: null,
    };

    mockCreateNoProgram.mockReturnValueOnce(stubASTAndNoProgram);

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: undefined,
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBe(stubASTAndNoProgram);
  });

  it('passes an absolute, case-matching file path to service.openClientFile', () => {
    const { service } = createMockProjectService();

    useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: undefined,
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

  it('throws an error when hasFullTypeInformation is enabled and the file is both in the project service and allowDefaultProject', () => {
    const { service } = createMockProjectService();

    service.openClientFile.mockReturnValueOnce({
      configFileName: 'tsconfig.json',
    });

    expect(() =>
      useProgramFromProjectService(
        {
          allowDefaultProject: [mockParseSettings.filePath],
          maximumDefaultProjectFileMatchCount: 8,
          service,
        },
        mockParseSettings,
        true,
        new Set(),
      ),
    ).toThrow(
      `${mockParseSettings.filePath} was included by allowDefaultProject but also was found in the project service. Consider removing it from allowDefaultProject.`,
    );
  });

  it('throws an error when hasFullTypeInformation is enabled and the file is neither in the project service nor allowDefaultProject', () => {
    const { service } = createMockProjectService();

    service.openClientFile.mockReturnValueOnce({});

    expect(() =>
      useProgramFromProjectService(
        createProjectServiceSettings({
          allowDefaultProject: [],
          service,
        }),
        mockParseSettings,
        true,
        new Set(),
      ),
    ).toThrow(
      `${mockParseSettings.filePath} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject.`,
    );
  });

  it('throws an error when more than the maximum allowed file count is matched to the default project', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({});

    expect(() =>
      useProgramFromProjectService(
        createProjectServiceSettings({
          allowDefaultProject: [mockParseSettings.filePath],
          maximumDefaultProjectFileMatchCount: 2,
          service,
        }),
        mockParseSettings,
        true,
        new Set(['a', 'b']),
      ),
    ).toThrow(`Too many files (>2) have matched the default project.

Having many files run with the default project is known to cause performance issues and slow down linting.

See https://typescript-eslint.io/troubleshooting/typed-linting#allowdefaultproject-glob-too-wide

Matching files:
- a
- b
- ${path.normalize('/repos/repo/path/PascalCaseDirectory/camelCaseFile.ts')}

If you absolutely need more files included, set parserOptions.projectService.maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING to a larger value.
`);
  });

  it('truncates the files printed by the maximum allowed files error when they exceed the print limit', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({});

    expect(() =>
      useProgramFromProjectService(
        createProjectServiceSettings({
          allowDefaultProject: [mockParseSettings.filePath],
          maximumDefaultProjectFileMatchCount: 2,
          service,
        }),
        mockParseSettings,
        true,
        new Set(Array.from({ length: 100 }, (_, i) => String(i))),
      ),
    ).toThrow(`Too many files (>2) have matched the default project.

Having many files run with the default project is known to cause performance issues and slow down linting.

See https://typescript-eslint.io/troubleshooting/typed-linting#allowdefaultproject-glob-too-wide

Matching files:
- 0
- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10
- 11
- 12
- 13
- 14
- 15
- 16
- 17
- 18
- 19
...and 81 more files

If you absolutely need more files included, set parserOptions.projectService.maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING to a larger value.
`);
  });

  it('returns undefined when hasFullTypeInformation is disabled, the file is both in the project service and allowDefaultProject, and the service does not have a matching program', () => {
    const { service } = createMockProjectService();

    mockGetProgram.mockReturnValueOnce(undefined);

    service.openClientFile.mockReturnValueOnce({
      configFileName: 'tsconfig.json',
    });

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: [mockParseSettings.filePath],
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBeUndefined();
  });

  it('returns a created program when hasFullTypeInformation is disabled, the file is both in the project service and allowDefaultProject, and the service has a matching program', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({
      configFileName: 'tsconfig.json',
    });
    mockCreateProjectProgram.mockReturnValueOnce(program);

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: [mockParseSettings.filePath],
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBe(program);
  });

  it('returns undefined when hasFullTypeInformation is disabled, the file is neither in the project service nor allowDefaultProject, and the service has a matching program', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({});
    mockCreateProjectProgram.mockReturnValueOnce(program);

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: [],
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBeUndefined();
  });

  it('returns undefined when hasFullTypeInformation is disabled, the file is in the project service, the service has a matching program, and no out', () => {
    const { service } = createMockProjectService();
    const program = { getSourceFile: jest.fn() };

    mockGetProgram.mockReturnValueOnce(program);

    service.openClientFile.mockReturnValueOnce({
      configFileName: 'tsconfig.json',
    });
    mockCreateProjectProgram.mockReturnValueOnce(program);

    const actual = useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: [],
        maximumDefaultProjectFileMatchCount: 0,
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(actual).toBeUndefined();
  });

  it('does not call setHostConfiguration on the service with default extensions if extraFileExtensions are not provided', () => {
    const { service } = createMockProjectService();

    useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: [mockParseSettings.filePath],
        service,
      }),
      mockParseSettings,
      false,
      new Set(),
    );

    expect(service.setHostConfiguration).not.toHaveBeenCalled();
  });

  it('does not call setHostConfiguration on the service with default extensions if extraFileExtensions is empty', () => {
    const { service } = createMockProjectService();

    useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: [mockParseSettings.filePath],
        service,
      }),
      {
        ...mockParseSettings,
        extraFileExtensions: [],
      },
      false,
      new Set(),
    );

    expect(service.setHostConfiguration).not.toHaveBeenCalled();
  });

  it('calls setHostConfiguration on the service with default extensions to use extraFileExtensions when it is provided', () => {
    const { service } = createMockProjectService();

    useProgramFromProjectService(
      createProjectServiceSettings({
        allowDefaultProject: [mockParseSettings.filePath],
        service,
      }),
      {
        ...mockParseSettings,
        extraFileExtensions: ['.vue'],
      },
      false,
      new Set(),
    );

    expect(service.setHostConfiguration).toHaveBeenCalledWith({
      extraFileExtensions: [
        {
          extension: '.vue',
          isMixedContent: false,
          scriptKind: ts.ScriptKind.Deferred,
        },
      ],
    });
  });

  it('does not call setHostConfiguration on the service to use extraFileExtensions when unchanged', () => {
    const { service } = createMockProjectService();
    const settings = createProjectServiceSettings({
      allowDefaultProject: [mockParseSettings.filePath],
      service,
    });

    useProgramFromProjectService(
      settings,
      {
        ...mockParseSettings,
        extraFileExtensions: ['.vue'],
      },
      false,
      new Set(),
    );

    expect(service.setHostConfiguration).toHaveBeenCalledTimes(1);
    expect(service.setHostConfiguration).toHaveBeenCalledWith({
      extraFileExtensions: [
        {
          extension: '.vue',
          isMixedContent: false,
          scriptKind: ts.ScriptKind.Deferred,
        },
      ],
    });

    useProgramFromProjectService(
      settings,
      {
        ...mockParseSettings,
        extraFileExtensions: ['.vue'],
      },
      false,
      new Set(),
    );
    expect(service.setHostConfiguration).toHaveBeenCalledTimes(1);
  });

  it('calls setHostConfiguration on the service to use extraFileExtensions when changed', () => {
    const { service } = createMockProjectService();
    const settings = createProjectServiceSettings({
      allowDefaultProject: [mockParseSettings.filePath],
      service,
    });

    useProgramFromProjectService(
      settings,
      {
        ...mockParseSettings,
        extraFileExtensions: ['.vue'],
      },
      false,
      new Set(),
    );

    expect(service.setHostConfiguration).toHaveBeenCalledTimes(1);
    expect(service.setHostConfiguration).toHaveBeenCalledWith({
      extraFileExtensions: [
        {
          extension: '.vue',
          isMixedContent: false,
          scriptKind: ts.ScriptKind.Deferred,
        },
      ],
    });

    useProgramFromProjectService(
      settings,
      {
        ...mockParseSettings,
        extraFileExtensions: [],
      },
      false,
      new Set(),
    );

    expect(service.setHostConfiguration).toHaveBeenCalledTimes(2);
    expect(service.setHostConfiguration).toHaveBeenCalledWith({
      extraFileExtensions: [],
    });
  });

  it('calls setHostConfiguration on the service with non-default extensions to use defaults when extraFileExtensions are not provided', () => {
    const { service } = createMockProjectService();
    const settings = createProjectServiceSettings({
      allowDefaultProject: [mockParseSettings.filePath],
      service,
    });

    useProgramFromProjectService(
      settings,
      {
        ...mockParseSettings,
        extraFileExtensions: ['.vue'],
      },
      false,
      new Set(),
    );

    expect(service.setHostConfiguration).toHaveBeenCalledTimes(1);
    expect(service.setHostConfiguration).toHaveBeenCalledWith({
      extraFileExtensions: [
        {
          extension: '.vue',
          isMixedContent: false,
          scriptKind: ts.ScriptKind.Deferred,
        },
      ],
    });

    useProgramFromProjectService(settings, mockParseSettings, false, new Set());

    expect(service.setHostConfiguration).toHaveBeenCalledTimes(2);
    expect(service.setHostConfiguration).toHaveBeenCalledWith({
      extraFileExtensions: [],
    });
  });
});
