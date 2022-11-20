import { join } from 'path';

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
  describe('preserveNodeMaps', () => {
    const code = 'var a = true';
    const baseConfig: TSESTreeOptions = {
      comment: true,
      tokens: true,
      range: true,
      loc: true,
      filePath: 'file.ts',
    };
    const projectConfig: TSESTreeOptions = {
      ...baseConfig,
      tsconfigRootDir: FIXTURES_DIR,
      project: './tsconfig.json',
    };

    it('should not impact the use of parse()', () => {
      const resultWithNoOptionSet = parser.parse(code, baseConfig);
      const resultWithOptionSetToTrue = parser.parse(code, {
        ...baseConfig,
        preserveNodeMaps: true,
      });
      const resultWithOptionSetToFalse = parser.parse(code, {
        ...baseConfig,
        preserveNodeMaps: false,
      });
      const resultWithOptionSetExplicitlyToUndefined = parser.parse(code, {
        ...baseConfig,
        preserveNodeMaps: undefined,
      });

      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToTrue);
      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToFalse);
      expect(resultWithNoOptionSet).toMatchObject(
        resultWithOptionSetExplicitlyToUndefined,
      );
    });

    it('should not impact the use of parseWithNodeMaps()', () => {
      const resultWithNoOptionSet = parser.parseWithNodeMaps(code, baseConfig);
      const resultWithOptionSetToTrue = parser.parseWithNodeMaps(code, {
        ...baseConfig,
        preserveNodeMaps: true,
      });
      const resultWithOptionSetToFalse = parser.parseWithNodeMaps(code, {
        ...baseConfig,
        preserveNodeMaps: false,
      });
      const resultWithOptionSetExplicitlyToUndefined = parser.parseWithNodeMaps(
        code,
        {
          ...baseConfig,
          preserveNodeMaps: undefined,
        },
      );

      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToTrue);
      expect(resultWithNoOptionSet).toMatchObject(resultWithOptionSetToFalse);
      expect(resultWithNoOptionSet).toMatchObject(
        resultWithOptionSetExplicitlyToUndefined,
      );
    });

    it('should preserve node maps by default for parseAndGenerateServices()', () => {
      const noOptionSet = parser.parseAndGenerateServices(code, baseConfig);

      expect(noOptionSet.services.esTreeNodeToTSNodeMap).toEqual(
        expect.any(WeakMap),
      );
      expect(noOptionSet.services.tsNodeToESTreeNodeMap).toEqual(
        expect.any(WeakMap),
      );

      const withProjectNoOptionSet = parser.parseAndGenerateServices(
        code,
        projectConfig,
      );

      expect(withProjectNoOptionSet.services.esTreeNodeToTSNodeMap).toEqual(
        expect.any(WeakMap),
      );
      expect(withProjectNoOptionSet.services.tsNodeToESTreeNodeMap).toEqual(
        expect.any(WeakMap),
      );
    });

    function checkNodeMaps(setting: boolean): void {
      it('without project', () => {
        const parseResult = parser.parseAndGenerateServices(code, {
          ...baseConfig,
          preserveNodeMaps: setting,
        });

        expect(parseResult.services.esTreeNodeToTSNodeMap).toBeDefined();
        expect(parseResult.services.tsNodeToESTreeNodeMap).toBeDefined();
        expect(
          parseResult.services.esTreeNodeToTSNodeMap.has(
            parseResult.ast.body[0],
          ),
        ).toBe(setting);
        expect(
          parseResult.services.tsNodeToESTreeNodeMap.has(
            parseResult.services.program.getSourceFile('estree.ts'),
          ),
        ).toBe(setting);
      });

      it('with project', () => {
        const parseResult = parser.parseAndGenerateServices(code, {
          ...projectConfig,
          preserveNodeMaps: setting,
        });

        expect(parseResult.services.esTreeNodeToTSNodeMap).toBeDefined();
        expect(parseResult.services.tsNodeToESTreeNodeMap).toBeDefined();
        expect(
          parseResult.services.esTreeNodeToTSNodeMap.has(
            parseResult.ast.body[0],
          ),
        ).toBe(setting);
        expect(
          parseResult.services.tsNodeToESTreeNodeMap.has(
            parseResult.services.program.getSourceFile(
              join(FIXTURES_DIR, 'file.ts'),
            ),
          ),
        ).toBe(setting);
      });
    }

    describe('should preserve node maps for parseAndGenerateServices() when option is `true`, regardless of `project` config', () => {
      checkNodeMaps(true);
    });

    describe('should not preserve node maps for parseAndGenerateServices() when option is `false`, regardless of `project` config', () => {
      checkNodeMaps(false);
    });
  });
});
