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

describe('parseWithNodeMaps()', () => {
  describe('projectFolderIgnoreList', () => {
    beforeEach(() => {
      parser.clearCaches();
    });

    const PROJECT_DIR = resolve(FIXTURES_DIR, '../projectFolderIgnoreList');
    const code = 'var a = true';
    const config: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      tsconfigRootDir: PROJECT_DIR,
      project: './**/tsconfig.json',
    };

    const testParse =
      (
        filePath: 'ignoreme' | 'includeme',
        projectFolderIgnoreList?: TSESTreeOptions['projectFolderIgnoreList'],
      ) =>
      (): void => {
        parser.parseAndGenerateServices(code, {
          ...config,
          projectFolderIgnoreList,
          filePath: join(PROJECT_DIR, filePath, './file.ts'),
        });
      };

    it('ignores nothing when given nothing', () => {
      expect(testParse('ignoreme')).not.toThrow();
      expect(testParse('includeme')).not.toThrow();
    });

    it('ignores a folder when given a string glob', () => {
      const ignore = ['**/ignoreme/**'];
      expect(testParse('ignoreme', ignore)).toThrow();
      expect(testParse('includeme', ignore)).not.toThrow();
    });
  });
});
