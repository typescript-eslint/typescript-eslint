import fs from 'node:fs';
import path from 'node:path';

import type { ParseSettings } from '../../src/parseSettings';

import {
  clearSingleRunProjectServicePrograms,
  useSingleRunProgramForProjectService,
} from '../../src/create-program/useSingleRunProgramForProjectService';

const fixturesDir = path.join(__dirname, '..', 'fixtures');

function createParseSettings(
  fixture: string,
  fileName: string,
  overrides: Partial<ParseSettings> = {},
): ParseSettings {
  const filePath = path.join(fixturesDir, fixture, fileName);

  return {
    codeFullText: fs.readFileSync(filePath, 'utf8'),
    extraFileExtensions: [],
    filePath,
    jsDocParsingMode: undefined,
    projectService: { allowDefaultProject: undefined },
    tsconfigRootDir: path.join(fixturesDir, fixture),
    ...overrides,
  } as unknown as ParseSettings;
}

describe(useSingleRunProgramForProjectService, () => {
  afterEach(() => {
    clearSingleRunProjectServicePrograms();
  });

  it('returns the file from a Program created for its nearest tsconfig', () => {
    const actual = useSingleRunProgramForProjectService(
      createParseSettings('simpleProject', 'file.ts'),
    );

    expect(actual?.ast.fileName).toBe(
      path.join(fixturesDir, 'simpleProject', 'file.ts').replaceAll('\\', '/'),
    );
  });

  it('reuses one Program for files with the same tsconfig', () => {
    const first = useSingleRunProgramForProjectService(
      createParseSettings('simpleProject', 'file.ts'),
    );
    const second = useSingleRunProgramForProjectService(
      createParseSettings('simpleProject', 'file-jsx.tsx'),
    );

    expect(second?.program).toBe(first?.program);
  });

  it('returns undefined when the file text differs from the file on disk', () => {
    const actual = useSingleRunProgramForProjectService(
      createParseSettings('simpleProject', 'file.ts', {
        codeFullText: 'export const changed = true;',
      }),
    );

    assert.isUndefined(actual);
  });

  it('returns undefined when the nearest tsconfig has project references', () => {
    const actual = useSingleRunProgramForProjectService(
      createParseSettings('projectReferences', 'file.ts'),
    );

    assert.isUndefined(actual);
  });

  it('returns undefined when allowDefaultProject is set', () => {
    const actual = useSingleRunProgramForProjectService(
      createParseSettings('simpleProject', 'file.ts', {
        projectService: {
          allowDefaultProject: ['*.js'],
        } as ParseSettings['projectService'],
      }),
    );

    assert.isUndefined(actual);
  });

  it('returns undefined when extraFileExtensions are set', () => {
    const actual = useSingleRunProgramForProjectService(
      createParseSettings('simpleProject', 'file.ts', {
        extraFileExtensions: ['.vue'],
      }),
    );

    assert.isUndefined(actual);
  });
});
