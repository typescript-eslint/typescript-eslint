import * as fs from 'node:fs';
import * as path from 'node:path';

import type { TSESTreeOptions } from '../../src/parser-options';

import { clearCaches } from '../../src/clear-caches';
import { parseAndGenerateServices } from '../../src/parser';
import { useProgramFromProjectService } from '../../src/useProgramFromProjectService';

vi.mock(
  import('../../src/useProgramFromProjectService.js'),
  async importOriginal => {
    const actual = await importOriginal();

    return {
      ...actual,
      useProgramFromProjectService: vi.fn(
        actual.useProgramFromProjectService,
      ) as unknown as typeof actual.useProgramFromProjectService,
    };
  },
);

const fixturesDir = path.join(__dirname, '..', 'fixtures');

function parse(
  fixture: string,
  fileName: string,
  { code, ...options }: TSESTreeOptions & { code?: string } = {},
) {
  const filePath = path.join(fixturesDir, fixture, fileName);

  return parseAndGenerateServices(code ?? fs.readFileSync(filePath, 'utf8'), {
    filePath,
    projectService: true,
    tsconfigRootDir: path.join(fixturesDir, fixture),
    ...options,
  });
}

describe('parseAndGenerateServices with projectService in single-run mode', () => {
  beforeEach(() => {
    vi.stubEnv('TSESTREE_SINGLE_RUN', 'true');
    clearCaches();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('uses one Program per tsconfig instead of the project service', () => {
    const first = parse('simpleProject', 'file.ts');
    const second = parse('simpleProject', 'file-jsx.tsx');

    expect(second.services.program).toBe(first.services.program);
    expect(useProgramFromProjectService).not.toHaveBeenCalled();
  });

  it('uses the project service when the file text differs from disk', () => {
    parse('simpleProject', 'file.ts', { code: 'export const changed = true;' });

    expect(useProgramFromProjectService).toHaveBeenCalledOnce();
  });

  it('uses the project service when the tsconfig has project references', () => {
    expect(() => parse('projectReferences', 'file.ts')).toThrow(
      /was not found by the project service/,
    );
    expect(useProgramFromProjectService).toHaveBeenCalledOnce();
  });

  it('uses the project service when allowDefaultProject is set', () => {
    parse('simpleProject', 'file.ts', {
      projectService: { allowDefaultProject: ['*.js'] },
    });

    expect(useProgramFromProjectService).toHaveBeenCalledOnce();
  });

  it('uses the project service when extraFileExtensions are set', () => {
    parse('simpleProject', 'file.ts', { extraFileExtensions: ['.vue'] });

    expect(useProgramFromProjectService).toHaveBeenCalledOnce();
  });
});
