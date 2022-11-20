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

/**
 * Aligns paths between environments, node for windows uses `\`, for linux and mac uses `/`
 */
function alignErrorPath(error: Error): never {
  error.message = error.message.replace(/\\(?!["])/gm, '/');
  throw error;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseAndGenerateServices', () => {
  describe('invalid project error messages', () => {
    it('throws when non of multiple projects include the file', () => {
      const PROJECT_DIR = resolve(FIXTURES_DIR, '../invalidFileErrors');
      const code = 'var a = true';
      const config: TSESTreeOptions = {
        comment: true,
        tokens: true,
        range: true,
        loc: true,
        tsconfigRootDir: PROJECT_DIR,
        project: ['./**/tsconfig.json', './**/tsconfig.extra.json'],
      };
      const testParse = (filePath: string) => (): void => {
        try {
          parser.parseAndGenerateServices(code, {
            ...config,
            filePath: join(PROJECT_DIR, filePath),
          });
        } catch (error) {
          throw alignErrorPath(error as Error);
        }
      };

      expect(testParse('ts/notIncluded0j1.ts')).toThrowErrorMatchingSnapshot();
    });
  });
});
