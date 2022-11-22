import { join, resolve } from 'path';

import * as parser from '../../src';
import type * as astConverterModule from '../../src/ast-converter';
import type * as sharedParserUtilsModule from '../../src/create-program/shared';
import type { TSESTreeOptions } from '../../src/parser-options';

const FIXTURES_DIR = join(__dirname, '../fixtures/simpleProject');

// we can't spy on the exports of an ES module - so we instead have to mock the entire module
jest.mock('../../src/ast-converter', () => {
  const astConverterActual = jest.requireActual<typeof astConverterModule>(
    '../../src/ast-converter',
  );

  return {
    ...astConverterActual,
    __esModule: true,
    astConverter: jest.fn(astConverterActual.astConverter),
  };
});
jest.mock('../../src/create-program/shared', () => {
  const sharedActual = jest.requireActual<typeof sharedParserUtilsModule>(
    '../../src/create-program/shared',
  );

  return {
    ...sharedActual,
    __esModule: true,
    createDefaultCompilerOptionsFromExtra: jest.fn(
      sharedActual.createDefaultCompilerOptionsFromExtra,
    ),
  };
});

// Tests in CI by default run with lowercase program file names,
// resulting in path.relative results starting with many "../"s
jest.mock('typescript', () => {
  const ts = jest.requireActual('typescript');
  return {
    ...ts,
    sys: {
      ...ts.sys,
      useCaseSensitiveFileNames: true,
    },
  };
});

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
      it('returns error because __PLACEHOLDER__ can not be resolved', () => {
        expect(
          parser
            .parseAndGenerateServices(code, withDefaultProgramConfig)
            .services.program.getSemanticDiagnostics(),
        ).toHaveProperty(
          [0, 'messageText'],
          "Cannot find module '__PLACEHOLDER__' or its corresponding type declarations.",
        );
      });
    });
  });
});
