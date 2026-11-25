import type * as ts from 'typescript/lib/tsserverlibrary';

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { createProjectService } from '../src/createProjectService.js';

describe('reuseDeclarationFiles', () => {
  let directory: string;

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'reuse-declarations-'));

    fs.writeFileSync(
      path.join(directory, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { lib: ['es5'] } }),
    );

    fs.writeFileSync(
      path.join(directory, 'file.ts'),
      'export const value = 1;\n',
    );
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reuses the previous service declaration files, but not other files', () => {
    vi.stubEnv('TYPESCRIPT_ESLINT_INTERNAL_REUSE_DECLARATION_FILES', 'true');

    const first = getSourceFiles(directory);
    const second = getSourceFiles(directory);

    expect(second.lib).toBe(first.lib);
    expect(second.file).not.toBe(first.file);
  });

  it('does not reuse anything when not enabled', () => {
    const first = getSourceFiles(directory);
    const second = getSourceFiles(directory);

    expect(second.lib).not.toBe(first.lib);
  });
});

function getSourceFiles(directory: string) {
  const filePath = path.join(directory, 'file.ts');

  const { service } = createProjectService({ tsconfigRootDir: directory });

  service.openClientFile(filePath);

  const program = service
    .getDefaultProjectForFile(filePath as ts.server.NormalizedPath, true)
    ?.getLanguageService(true)
    .getProgram();

  return {
    file: program?.getSourceFile(filePath),

    lib: program
      ?.getSourceFiles()
      .find(
        sourceFile => path.basename(sourceFile.fileName) === 'lib.es5.d.ts',
      ),
  };
}
