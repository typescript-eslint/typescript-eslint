import * as glob from 'glob';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as ts from 'typescript';

import type { TSESTree, TSESTreeOptions } from '../../src/index.js';

import { createProgramFromConfigFile as createProgram } from '../../src/create-program/useProvidedPrograms.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';
import {
  deeplyCopy,
  formatSnapshotName,
  parseCodeAndGenerateServices,
} from '../test-utils/test-utils.js';

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'semanticInfo');

const testFiles = glob.sync(`**/*.src.ts`, {
  cwd: FIXTURES_DIR,
});

function createOptions(fileName: string): { cwd?: string } & TSESTreeOptions {
  return {
    comment: true,
    disallowAutomaticSingleRunInference: true,
    errorOnUnknownASTType: true,
    filePath: fileName,
    jsx: false,
    loc: true,
    loggerFn: false,
    project: `./tsconfig.json`,
    range: true,
    tokens: true,
    tsconfigRootDir: FIXTURES_DIR,
  };
}

describe('semanticInfo', async () => {
  beforeEach(() => {
    // ensure tsconfig-parser watch caches are clean for each test
    clearCaches();

    vi.stubEnv('TSESTREE_SINGLE_RUN', '');
    vi.stubEnv(
      'TYPESCRIPT_ESLINT_IGNORE_PROJECT_AND_PROJECT_SERVICE_ERROR',
      'true',
    );
  });

  vi.stubEnv(
    'TYPESCRIPT_ESLINT_IGNORE_PROJECT_AND_PROJECT_SERVICE_ERROR',
    'true',
  );

  // test all AST snapshots
  const testCases = await Promise.all(
    testFiles.map(async filename => {
      const code = await fs.readFile(path.join(FIXTURES_DIR, filename), {
        encoding: 'utf-8',
      });
      const snapshotName = formatSnapshotName(
        filename,
        FIXTURES_DIR,
        path.extname(filename),
      );

      const { ast } = parseAndGenerateServices(code, createOptions(filename));

      const result = deeplyCopy(ast);

      return [snapshotName, result] as const;
    }),
  );

  it.for(testCases)('%s', ([, result], { expect }) => {
    expect(result).toMatchSnapshot();
  });

  it(`should cache the created ts.program`, async () => {
    const filename = testFiles[0];
    const code = await fs.readFile(path.join(FIXTURES_DIR, filename), {
      encoding: 'utf-8',
    });
    const options = createOptions(filename);
    const optionsProjectString = {
      ...options,
      project: './tsconfig.json',
    };
    expect(
      parseAndGenerateServices(code, optionsProjectString).services.program,
    ).toBe(
      parseAndGenerateServices(code, optionsProjectString).services.program,
    );
  });

  it(`should handle "project": "./tsconfig.json" and "project": ["./tsconfig.json"] the same`, async () => {
    const filename = testFiles[0];
    const code = await fs.readFile(path.join(FIXTURES_DIR, filename), {
      encoding: 'utf-8',
    });
    const options = createOptions(filename);
    const optionsProjectString = {
      ...options,
      project: './tsconfig.json',
    };
    const optionsProjectArray = {
      ...options,
      project: ['./tsconfig.json'],
    };
    const fromString = parseAndGenerateServices(code, optionsProjectString);
    const fromArray = parseAndGenerateServices(code, optionsProjectArray);

    expect(fromString.services.program).toBe(fromArray.services.program);

    expect(fromString.ast).toStrictEqual(fromArray.ast);
    expect(fromString.services.esTreeNodeToTSNodeMap).toStrictEqual(
      fromArray.services.esTreeNodeToTSNodeMap,
    );
    expect(fromString.services.tsNodeToESTreeNodeMap).toStrictEqual(
      fromArray.services.tsNodeToESTreeNodeMap,
    );
  });

  it(`should resolve absolute and relative tsconfig paths the same`, async () => {
    const filename = testFiles[0];
    const code = await fs.readFile(path.join(FIXTURES_DIR, filename), {
      encoding: 'utf-8',
    });
    const options = createOptions(filename);
    const optionsAbsolutePath = {
      ...options,
      project: `${__dirname}/../fixtures/semanticInfo/tsconfig.json`,
    };
    const optionsRelativePath = {
      ...options,
      project: `./tsconfig.json`,
    };
    const absolutePathResult = parseAndGenerateServices(
      code,
      optionsAbsolutePath,
    );
    const relativePathResult = parseAndGenerateServices(
      code,
      optionsRelativePath,
    );

    assert.isNotNull(absolutePathResult.services.program);

    assert.isNotNull(relativePathResult.services.program);

    expect(
      absolutePathResult.services.program.getResolvedProjectReferences(),
    ).toStrictEqual(
      relativePathResult.services.program.getResolvedProjectReferences(),
    );
  });

  // case-specific tests
  it.skipIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true')(
    'isolated-file tests',
    async () => {
      const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
      const parseResult = parseCodeAndGenerateServices(
        await fs.readFile(fileName, { encoding: 'utf-8' }),
        createOptions(fileName),
      );

      assert.isParserServices(parseResult.services);

      // get type checker
      const checker = parseResult.services.program.getTypeChecker();

      // get number node (ast shape validated by snapshot)
      const declaration = (
        parseResult.ast.body[0] as TSESTree.VariableDeclaration
      ).declarations[0];

      assert.isNotNull(declaration.init);

      const arrayMember = (declaration.init as TSESTree.ArrayExpression)
        .elements[0];

      assert.isNotNull(arrayMember);

      // get corresponding TS node
      const tsArrayMember =
        parseResult.services.esTreeNodeToTSNodeMap.get(arrayMember);

      expect(tsArrayMember.kind).toBe(ts.SyntaxKind.NumericLiteral);

      expect(tsArrayMember).toHaveProperty('text', '3');

      // get type of TS node
      const arrayMemberType = checker.getTypeAtLocation(tsArrayMember);

      expect(arrayMemberType.flags).toBe(ts.TypeFlags.NumberLiteral);

      // using an internal api
      expect(arrayMemberType).toHaveProperty('value', 3);

      // make sure it maps back to original ESTree node
      expect(
        parseResult.services.tsNodeToESTreeNodeMap.get(tsArrayMember),
      ).toBe(arrayMember);

      // get bound name
      const boundName = declaration.id as TSESTree.Identifier;

      expect(boundName.name).toBe('x');

      const tsBoundName =
        parseResult.services.esTreeNodeToTSNodeMap.get(boundName);

      assert.isTSNodeOfNumberArrayType({ checker, tsNode: tsBoundName });

      expect(parseResult.services.tsNodeToESTreeNodeMap.get(tsBoundName)).toBe(
        boundName,
      );
    },
  );

  it.skipIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true')(
    'isolated-vue-file tests',
    async () => {
      const fileName = path.resolve(FIXTURES_DIR, 'extra-file-extension.vue');
      const parseResult = parseCodeAndGenerateServices(
        await fs.readFile(fileName, { encoding: 'utf-8' }),
        {
          ...createOptions(fileName),
          extraFileExtensions: ['.vue'],
        },
      );

      assert.isParserServices(parseResult.services);

      // get type checker
      const checker = parseResult.services.program.getTypeChecker();

      // get number node (ast shape validated by snapshot)
      const declaration = (
        parseResult.ast.body[0] as TSESTree.VariableDeclaration
      ).declarations[0];

      assert.isNotNull(declaration.init);

      const arrayMember = (declaration.init as TSESTree.ArrayExpression)
        .elements[0];

      assert.isNotNull(arrayMember);

      // get corresponding TS node
      const tsArrayMember =
        parseResult.services.esTreeNodeToTSNodeMap.get(arrayMember);

      expect(tsArrayMember.kind).toBe(ts.SyntaxKind.NumericLiteral);

      expect(tsArrayMember).toHaveProperty('text', '3');

      // get type of TS node
      const arrayMemberType = checker.getTypeAtLocation(tsArrayMember);

      expect(arrayMemberType.flags).toBe(ts.TypeFlags.NumberLiteral);

      // using an internal api
      expect(arrayMemberType).toHaveProperty('value', 3);

      // make sure it maps back to original ESTree node
      expect(
        parseResult.services.tsNodeToESTreeNodeMap.get(tsArrayMember),
      ).toBe(arrayMember);

      // get bound name
      const boundName = declaration.id as TSESTree.Identifier;

      expect(boundName.name).toBe('x');

      const tsBoundName =
        parseResult.services.esTreeNodeToTSNodeMap.get(boundName);

      assert.isTSNodeOfNumberArrayType({ checker, tsNode: tsBoundName });

      expect(parseResult.services.tsNodeToESTreeNodeMap.get(tsBoundName)).toBe(
        boundName,
      );
    },
  );

  it('non-existent-estree-nodes tests', async () => {
    const fileName = path.resolve(
      FIXTURES_DIR,
      'non-existent-estree-nodes.src.ts',
    );
    const parseResult = parseCodeAndGenerateServices(
      await fs.readFile(fileName, { encoding: 'utf-8' }),
      createOptions(fileName),
    );

    assert.isParserServices(parseResult.services);

    const binaryExpression = (
      parseResult.ast.body[0] as TSESTree.VariableDeclaration
    ).declarations[0].init;

    assert.isNotNull(binaryExpression);

    const tsBinaryExpression =
      parseResult.services.esTreeNodeToTSNodeMap.get(binaryExpression);

    expect(tsBinaryExpression.kind).toStrictEqual(
      ts.SyntaxKind.BinaryExpression,
    );

    const computedPropertyString = (
      (parseResult.ast.body[1] as TSESTree.ClassDeclaration).body
        .body[0] as TSESTree.PropertyDefinition
    ).key;
    const tsComputedPropertyString =
      parseResult.services.esTreeNodeToTSNodeMap.get(computedPropertyString);

    expect(tsComputedPropertyString.kind).toBe(ts.SyntaxKind.StringLiteral);
  });

  it('imported-file tests', async () => {
    const fileName = path.resolve(FIXTURES_DIR, 'import-file.src.ts');
    const parseResult = parseCodeAndGenerateServices(
      await fs.readFile(fileName, { encoding: 'utf-8' }),
      createOptions(fileName),
    );

    assert.isParserServices(parseResult.services);

    // get type checker
    expect(parseResult).toHaveProperty('services.program.getTypeChecker');

    const checker = parseResult.services.program.getTypeChecker();

    // get array node (ast shape validated by snapshot)
    // node is defined in other file than the parsed one
    const arrayBoundName = (
      (
        (parseResult.ast.body[1] as TSESTree.ExpressionStatement)
          .expression as TSESTree.CallExpression
      ).callee as TSESTree.MemberExpression
    ).object as TSESTree.Identifier;
    expect(arrayBoundName.name).toBe('arr');

    const tsArrayBoundName =
      parseResult.services.esTreeNodeToTSNodeMap.get(arrayBoundName);

    assert.isTSNodeOfNumberArrayType({ checker, tsNode: tsArrayBoundName });

    expect(
      parseResult.services.tsNodeToESTreeNodeMap.get(tsArrayBoundName),
    ).toBe(arrayBoundName);
  });

  it('non-existent file tests', () => {
    const parseResult = parseCodeAndGenerateServices(
      `const x = [parseInt("5")];`,
      {
        ...createOptions('<input>'),
        preserveNodeMaps: true,
        project: undefined,
      },
    );

    // get bound name
    const boundName = (parseResult.ast.body[0] as TSESTree.VariableDeclaration)
      .declarations[0].id as TSESTree.Identifier;
    expect(boundName.name).toBe('x');

    const tsBoundName =
      parseResult.services.esTreeNodeToTSNodeMap.get(boundName);

    expect(parseResult.services.tsNodeToESTreeNodeMap.get(tsBoundName)).toBe(
      boundName,
    );
  });

  it('non-existent file should provide parents nodes', () => {
    const parseResult = parseCodeAndGenerateServices(
      `function M() { return Base }`,
      { ...createOptions('<input>'), project: undefined },
    );

    assert.isNotParserServices(parseResult.services);
  });

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    `non-existent file should throw error when project provided`,
    () => {
      expect(() =>
        parseCodeAndGenerateServices(
          `function M() { return Base }`,
          createOptions('<input>'),
        ),
      ).toThrowError(
        /ESLint was configured to run on `<tsconfigRootDir>\/estree\.ts` using/,
      );
    },
  );

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'non-existent project file',
    async () => {
      const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
      const badConfig = createOptions(fileName);
      badConfig.project = './tsconfigs.json';
      const code = await fs.readFile(fileName, { encoding: 'utf-8' });
      expect(() => parseCodeAndGenerateServices(code, badConfig)).toThrowError(
        /Cannot read file .+tsconfigs\.json'/,
      );
    },
  );

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'fail to read project file',
    async () => {
      const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
      const badConfig = createOptions(fileName);
      badConfig.project = '.';
      const code = await fs.readFile(fileName, { encoding: 'utf-8' });
      expect(() => parseCodeAndGenerateServices(code, badConfig)).toThrowError(
        // case insensitive because unix based systems are case insensitive
        /Cannot read file .+semanticInfo'/i,
      );
    },
  );

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'malformed project file',
    async () => {
      const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
      const badConfig = createOptions(fileName);
      badConfig.project = './badTSConfig/tsconfig.json';
      const code = await fs.readFile(fileName, { encoding: 'utf-8' });
      expect(() =>
        parseCodeAndGenerateServices(code, badConfig),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Compiler option 'compileOnSave' requires a value of type boolean.]`,
      );
    },
  );

  it('empty programs array should throw', () => {
    const fileName = path.resolve(FIXTURES_DIR, 'isolated-file.src.ts');
    const badConfig = createOptions(fileName);
    badConfig.programs = [];
    expect(() =>
      parseAndGenerateServices('const foo = 5;', badConfig),
    ).toThrowError(
      'You have set parserOptions.programs to an empty array. This will cause all files to not be found in existing programs. Either provide one or more existing TypeScript Program instances in the array, or remove the parserOptions.programs setting.',
    );
  });

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    `first matching provided program instance is returned in result`,
    async () => {
      const filename = testFiles[0];
      const program1 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
      const program2 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
      const code = await fs.readFile(path.join(FIXTURES_DIR, filename), {
        encoding: 'utf-8',
      });
      const options = createOptions(filename);
      const optionsProjectString = {
        ...options,
        programs: [program1, program2],
        project: './tsconfig.json',
      };
      const parseResult = parseAndGenerateServices(code, optionsProjectString);
      expect(parseResult.services.program).toBe(program1);
    },
  );

  it.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'file not in single provided project instance in single-run mode should throw',
    () => {
      vi.stubEnv('TSESTREE_SINGLE_RUN', 'true');
      const filename = 'non-existent-file.ts';
      const options = createOptions(filename);
      const optionsWithProjectTrue = {
        ...options,
        programs: undefined,
        project: true,
      };
      expect(() =>
        parseAndGenerateServices('const foo = 5;', optionsWithProjectTrue),
      ).toThrowError(
        process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true'
          ? `${filename} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject.`
          : `The file was not found in any of the provided project(s): ${filename}`,
      );
    },
  );

  it('file not in single provided program instance should throw', () => {
    const filename = 'non-existent-file.ts';
    const program = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
    const options = createOptions(filename);
    const optionsWithSingleProgram = {
      ...options,
      programs: [program],
    };
    expect(() =>
      parseAndGenerateServices('const foo = 5;', optionsWithSingleProgram),
    ).toThrowError(
      process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true'
        ? `${filename} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject.`
        : `The file was not found in any of the provided program instance(s): ${filename}`,
    );
  });

  it('file not in multiple provided program instances should throw a program instance error', () => {
    const filename = 'non-existent-file.ts';
    const program1 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
    const options = createOptions(filename);
    const optionsWithSingleProgram = {
      ...options,
      programs: [program1],
    };
    expect(() =>
      parseAndGenerateServices('const foo = 5;', optionsWithSingleProgram),
    ).toThrowError(
      process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true'
        ? `${filename} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject.`
        : `The file was not found in any of the provided program instance(s): ${filename}`,
    );

    const program2 = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));
    const optionsWithMultiplePrograms = {
      ...options,
      programs: [program1, program2],
    };
    expect(() =>
      parseAndGenerateServices('const foo = 5;', optionsWithMultiplePrograms),
    ).toThrowError(
      process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE === 'true'
        ? `${filename} was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject.`
        : `The file was not found in any of the provided program instance(s): ${filename}`,
    );
  });

  it('createProgram fails on non-existent file', () => {
    expect(() => createProgram('tsconfig.non-existent.json')).toThrowError();
  });

  it('createProgram fails on tsconfig with errors', () => {
    expect(() =>
      createProgram(path.join(FIXTURES_DIR, 'badTSConfig', 'tsconfig.json')),
    ).toThrowError();
  });
});
