import { join, resolve } from 'path';

import * as parser from '../../src';
import type { TSESTreeOptions } from '../../src/parser-options';

const FIXTURES_DIR = join(__dirname, '../fixtures/simpleProject');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  describe('moduleResolver', () => {
    beforeEach(() => {
      parser.clearCaches();
    });

    const PROJECT_DIR = resolve(FIXTURES_DIR, '../moduleResolver');
    const code = `
      import { something } from '__PLACEHOLDER__';

      something();
    `;
    const config: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      project: './tsconfig.json',
      tsconfigRootDir: PROJECT_DIR,
      filePath: resolve(PROJECT_DIR, 'file.ts'),
    };
    const withDefaultProgramConfig: TSESTreeOptions = {
      ...config,
      project: './tsconfig.defaultProgram.json',
      createDefaultProgram: true,
    };

    describe('when file is not in the project and createDefaultProgram=true', () => {
      it('resolves __PLACEHOLDER__ correctly', () => {
        expect(
          parser
            .parseAndGenerateServices(code, {
              ...withDefaultProgramConfig,
              moduleResolver: resolve(PROJECT_DIR, './moduleResolver.js'),
            })
            .services.program.getSemanticDiagnostics(),
        ).toHaveLength(0);
      });
    });
  });
});
